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
import { chatType, stateType } from './chat.interface';
import { User } from 'src/entity/user.entity';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private chatService: ChatService) {}

  private connectUsers = new Map<string, Map<number, object>>();

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    payload: {
      classId: number;
    },
  ): Promise<object> {
    const { userId } = client.data;
    const { classId } = payload;
    const strClassId = String(payload.classId);

    client.data.classId = classId;

    const result = await this.chatService.isStudent(classId, userId);
    if (!result) {
      Logger.debug(`${userId}학생은 ${classId}반이 아닙니다.`);
      client.disconnect(true);
      return {};
    }

    const chatList = await this.chatService.findQuestion(
      classId,
      chatType.question,
    );

    const userList = await this.chatService.countStudentsInClass(classId);;
    if (this.connectUsers.has(strClassId)) {
      const room = this.connectUsers.get(strClassId);

      if (room.size !== userList[1]) {
        userList[0].forEach(({ userId, user }) => {
          if (!room.has(userId)) {
            room.set(userId, { name: user.name, state: stateType.disconnect });
          }
        });
      }
    } else {
      this.connectUsers.set(strClassId, new Map<number, object>());
      userList[0].forEach(({ userId, user }) => {
        this.connectUsers
          .get(strClassId)
          .set(userId, { name: user.name, state: stateType.disconnect });
      });
    }

    client.join(strClassId);
    client.broadcast.to(strClassId).emit('joinUser', { userId });

    Logger.debug(`joinRoom / ${userId}님이 ${classId}에 입장했습니다.`);
    console.log(this.server.sockets.adapter.rooms);

    this.connectUsers.get(strClassId).get(userId)['state'] = stateType.connect;

    console.log(this.connectUsers.get(strClassId), chatList);

    return {
      userList: Object.fromEntries(this.connectUsers.get(strClassId)),
      chatList: chatList.slice(0, 9),
    };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody('classId')
    classId: number,
  ): object {
    const userId = client.data.userId;
    const strClassId = String(classId);

    client.leave(strClassId);
    client.broadcast.to(strClassId).emit('leaveUser', userId);
    client.data.classId = undefined;

    this.connectUsers.get(strClassId).get(client.data.userId)['state'] =
      stateType.disconnect;

    Logger.debug(`leaveRoom / ${userId}님이 ${classId}에서 퇴장했습니다.`);
    console.log(this.server.sockets.adapter.rooms);
    return {};
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

    Logger.debug(`sendChat / (room: ${classId}) ${userId} : ${content}`);

    if (userId === undefined || classId === undefined) {
      client.disconnect(true);
      Logger.debug(`닉네임 설정이 안 돼있네요. 아니면 방에 들어가질 않았어요.`);
      return;
    }

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
    return { chatId: id, content };
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
    const userId: number = client.data.userId;
    const name: string = client.data.name;
    const { classId, content } = data;
    const id = uuid();

    Logger.debug(`sendQuestion / (room: ${classId}) ${userId} : ${content}`);

    if (userId === undefined || classId === undefined) {
      client.disconnect(true);
      Logger.debug(`닉네임 설정이 안 돼있네요. 아니면 방에 들어가질 않았어요.`);
      return;
    }

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

    return { chatId: id, content };
  }

  @SubscribeMessage('sendDelete')
  async handleDeleteChat(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      chatId: string;
    },
  ): Promise<object> {
    const { classId, chatId } = data;
    const result = await this.chatService.deleteChat(chatId);

    if (!result) {
      client.disconnect(true);
      Logger.debug(`없는 질문을 지웠어요. ${classId} / ${chatId}`);
      return {};
    }

    client.broadcast.to(String(classId)).emit('receiveDelete', { chatId });
    return { chatId };
  }

  @SubscribeMessage('sendResolved')
  async handleQuestionSolved(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      chatId: string;
    },
  ): Promise<object> {
    const { classId, chatId } = data;
    const { userId } = client.data;

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

    Logger.debug(
      `sendLikeUp / (room: ${classId}), ${chatId}, ${name} , ${userId}`,
    );

    const result = await this.chatService.likeUp(userId, classId, chatId);
    if (!result) {
      Logger.debug(
        `강제로 ${userId}가 끊겼습니다. 이미 올렸거나 잘못된 요청입니다.`,
      );
      client.disconnect(true);
      return;
    }

    client.broadcast
      .to(String(classId))
      .emit('receiveLikeUp', { userId, name, chatId });
    return {};
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

    Logger.debug(
      `sendLikeDown / (room: ${classId}), ${chatId}, ${name} , ${userId}`,
    );

    const result = await this.chatService.likeDown(userId, classId, chatId);
    if (!result) {
      Logger.debug(
        `강제로 ${userId}가 끊겼습니다. 이미 내렸거나 잘못된 요청입니다.`,
      );
      client.disconnect(true);
      return;
    }

    client.broadcast
      .to(String(classId))
      .emit('receiveLikeDown', { userId, name, chatId });
    return {};
  }

  @SubscribeMessage('changeMyState')
  handleReaction(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      state: stateType;
    },
  ): object {
    const { classId, state } = data;
    const userId = client.data.userId;

    this.connectUsers.get(String(classId)).get(client.data.userId)['state'] =
      state;

    client.broadcast
      .to(String(classId))
      .emit('changeState', { userId: client.data.userId, state });
    Logger.debug(`changeMyState / ${userId}이/가 ${state}로 변경`);

    console.log(this.connectUsers.get(String(classId)));
    return {};
  }

  async handleConnection(@ConnectedSocket() client: Socket): Promise<void> {
    const user: User = await this.chatService.verify(
      client.handshake.headers.authorization,
    );

    if (user === null) {
      client.disconnect(true);
      Logger.debug(`유효하지 않은 토큰입니다.`);
      return;
    }

    client.data.userId = user.id;
    client.data.name = user.name;

    Logger.debug(`${client.data.userId}/${client.data.name}이 들어왔어요.`);
    return;
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    const { userId, classId } = client.data;

    if (classId === undefined) {
      Logger.debug(`Disconnect / user:${userId}`);
      return;
    }
    const room = this.connectUsers.get(String(classId));
    if (room !== undefined) {
      room.get(userId)['state'] = stateType.disconnect;
    }

    this.server.to(String(classId)).emit('leaveUser', { userId });

    Logger.debug(`Disconnect / Data : ${userId}, ${classId}`);
    return;
  }
}
