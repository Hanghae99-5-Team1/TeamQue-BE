import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { ChatService } from './chat.service';
import { chatType, stateType, Room } from './chat.interface';
import { User } from 'src/entity/user.entity';
import * as errorMessage from '../error-message';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private roomMap: Map<number, Map<number, Room>>;
  private userMap: Map<number, Socket>;

  constructor(private chatService: ChatService) {
    this.roomMap = new Map<number, Map<number, Room>>();
    this.userMap = new Map<number, Socket>();
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    try {
      const token = client.handshake.headers.authorization;
      if (!token) throw errorMessage.emptyValueError;

      const user: User | null = await this.chatService.verify(token);
      if (!user) throw errorMessage.authenticationError;

      if (this.userMap.has(user.id))
        throw errorMessage.duplicateConnectionError;

      client.data.userId = user.id;
      client.data.name = user.name;
      this.userMap.set(user.id, client);

      Logger.debug(`[Connect] ${user.id}/${user.name}`);
      return;
    } catch (error) {
      this.errorDisconnect(client, 'Connect', error);
      return;
    }
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const { userId, classId, name } = client.data;

    if (this.roomMap.has(classId) && this.roomMap.get(classId).has(userId)) {
      this.roomMap.get(classId).get(userId).state = stateType.disconnect;
      this.server.to(String(classId)).emit('leaveUser', { userId, name });
    }
    this.userMap.delete(userId);
    Logger.debug(`[Disconnect] (${name})${userId}/${classId}`);
    return;
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
    },
  ): Promise<object | void> {
    try {
      const { userId, name } = client.data;
      const { classId } = payload;
      console.log(classId);
      if (!classId || typeof classId !== 'number')
        throw errorMessage.emptyValueError;

      const chatList = await this.chatService.findQuestion(
        classId,
        chatType.question,
      );

      const userList = await this.chatService.countStudentsInClass(classId);
      if (this.roomMap.has(classId)) {
        const room = this.roomMap.get(classId);
        if (room.size + 1 !== userList[1]) {
          userList[0].forEach((row) => {
            if (!room.has(row.userId)) {
              room.set(row.userId, {
                name: row.user.name,
                state: stateType.disconnect,
              });
            }
          });
        }
      } else {
        this.roomMap.set(classId, new Map<number, Room>());
        userList[0].forEach((row) => {
          this.roomMap.get(classId).set(row.userId, {
            name: row.user.name,
            state: stateType.disconnect,
          });
        });
        const teacher: User = await this.chatService.findTeacher(classId);
        this.roomMap.get(classId).set(teacher.id, {
          name: teacher.name,
          state: stateType.disconnect,
        });
      }

      client.join(String(classId));
      client.broadcast.to(String(classId)).emit('joinUser', { userId, name });

      Logger.debug(`[JoinRoom] User ${userId} entered the ${classId}`);

      this.roomMap.get(classId).get(userId).state = stateType.connect;
      client.data.classId = classId;

      console.log(this.roomMap);

      return {
        userList: Object.fromEntries(this.roomMap.get(classId)),
        chatList: chatList.slice(0, 9),
      };
    } catch (error) {
      this.errorDisconnect(client, 'JoinRoom', error);
      return;
    }
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody('classId')
    classId: number,
  ): object | void {
    try {
      const { userId } = client.data;

      if (!classId) throw errorMessage.emptyValueError;

      if (
        !this.roomMap.has(classId) &&
        !this.roomMap.get(classId).has(userId)
      ) {
        throw errorMessage.badRequest;
      }

      client.leave(String(classId));
      client.broadcast.to(String(classId)).emit('leaveUser', userId);
      client.data.classId = undefined;

      this.roomMap.get(classId).get(userId).state = stateType.disconnect;
      Logger.debug(`[LeaveRoom] User ${userId} leaved the ${classId}`);
      return {};
    } catch (error) {
      this.errorDisconnect(client, 'LeaveRoom', error);
      return;
    }
  }

  @SubscribeMessage('sendChat')
  handleChatMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      content: string;
    },
  ): object {
    const { userId, name } = client.data;
    const { classId, content } = data;
    const id = uuid();

    try {
      if (!userId || !classId) throw errorMessage.emptyValueError;

      this.chatService.saveChat(
        classId,
        userId,
        name,
        content,
        id,
        chatType.common,
      );

      client.broadcast
        .to(String(classId))
        .emit('receiveChat', { chatId: id, content, userId, name });

      Logger.debug(`sendChat / (room: ${classId}) ${userId} : ${content}`);
      return { chatId: id, content };
    } catch (error) {
      this.errorDisconnect(client, 'SendChat', error);
      return;
    }
  }

  @SubscribeMessage('sendQuestion')
  handleQuestionMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      content: string;
    },
  ): object {
    const { userId, name } = client.data;
    const { classId, content } = data;
    const id = uuid();

    try {
      if (!userId || !classId) throw errorMessage.emptyValueError;

      this.chatService.saveChat(
        classId,
        userId,
        name,
        content,
        id,
        chatType.question,
      );

      client.broadcast.to(String(classId)).emit('receiveQuestion', {
        chatId: id,
        content,
        userId,
        name,
      });

      Logger.debug(`sendQuestion / (room: ${classId}) ${userId} : ${content}`);
      return { chatId: id, content };
    } catch (error) {
      this.errorDisconnect(client, 'sendQuestion', error);
      return;
    }
  }

  @SubscribeMessage('sendDelete')
  async handleDeleteChat(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
      chatId: string;
    },
  ): Promise<object | void> {
    const { classId, chatId } = payload;

    try {
      if (!classId || !chatId) throw errorMessage.emptyValueError;

      const result = await this.chatService.deleteChat(chatId);
      if (!result) {
        client.disconnect(true);
        Logger.debug(`[SendDelete] ${classId} / ${chatId}`);
        return {};
      }
      client.broadcast.to(String(classId)).emit('receiveDelete', { chatId });
      return { chatId };
    } catch (error) {
      this.errorDisconnect(client, 'sendDelete', error);
      return;
    }
  }

  @SubscribeMessage('sendResolved')
  async handleQuestionSolved(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
      chatId: string;
    },
  ): Promise<object> {
    const { classId, chatId } = payload;
    const { userId } = client.data;

    try {
      if (!classId || !chatId) throw errorMessage.emptyValueError;

      const isWriter = await this.chatService.toggleResolved(
        classId,
        userId,
        chatId,
      );

      if (!isWriter) {
        Logger.debug(`방 ${classId} / ${userId}는 ${chatId}작성자가 아닌데요?`);
        client.disconnect(true);
        return;
      }
      Logger.debug(`sendResolved/ ${chatId}`);

      client.broadcast.to(String(classId)).emit('receiveResolved', { chatId });
      return { success: 'true' };
    } catch (error) {
      this.errorDisconnect(client, 'sendResolved', error);
      return;
    }
  }

  @SubscribeMessage('reportUser')
  handleReportUser(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      userId: number;
    },
  ): object {
    const { userId } = data;
    this.chatService.reportUser(userId);

    Logger.debug(`reportUser / ${userId} is reported`);
    return {};
  }

  @SubscribeMessage('sendLikeUp')
  async handleLikeUp(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
      chatId: string;
    },
  ): Promise<object | void> {
    const { name, userId } = client.data;
    const { classId, chatId } = payload;

    try {
      if (!classId || !chatId) throw errorMessage.emptyValueError;
      Logger.debug(
        `[SendLikeUp] (room: ${classId}), ${chatId}, ${name} , ${userId}`,
      );
      const result = await this.chatService.likeUp(userId, classId, chatId);
      if (!result) throw errorMessage.badRequest;

      client.broadcast
        .to(String(classId))
        .emit('receiveLikeUp', { userId, name, chatId });
      return {};
    } catch (error) {
      this.errorDisconnect(client, 'SendLikeUp', error);
      return;
    }
  }

  @SubscribeMessage('sendLikeDown')
  async handleLikeDown(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
      chatId: string;
    },
  ): Promise<object> {
    const { name, userId } = client.data;
    const { classId, chatId } = payload;

    try {
      if (!classId || !chatId) throw errorMessage.emptyValueError;

      const result = await this.chatService.likeDown(userId, classId, chatId);
      if (!result) throw errorMessage.badRequest;

      Logger.debug(
        `[SendLikeDown] (room: ${classId}), ${chatId}, ${name} , ${userId}`,
      );

      client.broadcast
        .to(String(classId))
        .emit('receiveLikeDown', { userId, name, chatId });
      return {};
    } catch (error) {
      this.errorDisconnect(client, 'SendLikeDown', error);
      return;
    }
  }

  @SubscribeMessage('changeMyState')
  handleReaction(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
      state: stateType;
    },
  ): object {
    const { classId, state } = payload;
    const userId = client.data.userId;

    try {
      if (!classId || !state) throw errorMessage.emptyValueError;

      this.roomMap.get(classId).get(userId).state = state;
      client.broadcast
        .to(String(classId))
        .emit('changeState', { userId: client.data.userId, state });
      Logger.debug(`changeMyState / ${userId}이/가 ${state}로 변경`);
      return {};
    } catch (error) {
      this.errorDisconnect(client, 'ChangeMyState', error);
      return;
    }
  }

  private errorDisconnect(client: Socket, event: string, error: string): void {
    const userId = client.data.userId;

    client.emit('error', error);
    client.disconnect(true);
    Logger.debug(`[${event}] ${userId} ${error} disconnect.`);
    return;
  }
}
