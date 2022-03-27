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
import { Inject, Logger } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import { ChatService } from './chat.service';

const chatType = {
  common: 1,
  question: 2,
} as const;

const userState = {
  disconnect: 1,
  connect: 2,
  correct: 3,
  incorrect: 4,
  question: 5,
} as const;

type chatType = typeof chatType[keyof typeof chatType];
type userState = typeof userState[keyof typeof userState];

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateWay implements OnGatewayConnection, OnGatewayDisconnect {
  @Inject()
  private chatService: ChatService;

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('init')
  handleNickname(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      nickname: string;
      token: string;
    },
  ): object {
    // 인증절차 필요함
    // if (tokenIsNotValidate === true) {
    //   client.disconnect(true);
    //   return;
    // }

    Logger.debug(`init / ${data.nickname}으로 설정됐습니다.`);
    client.data.nickname = data.nickname;
    client.emit('initOk');

    return {};
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody('classId')
    classId: number,
  ): Promise<object> {
    const nickname = client.data.nickname;

    if (classId === null || classId === undefined) {
      Logger.debug(`${nickname} / joinRoom / 인자가 없습니다.`);
      client.disconnect(true);
      return;
    }

    client.join(String(classId));
    client.broadcast
      .to(String(classId))
      .emit('joinUser', { nickname, state: userState.connect });
    client.data.state = userState.connect;

    Logger.debug(`joinRoom / ${nickname}님이 ${classId}에 입장했습니다.`);
    console.log(this.server.sockets.adapter.rooms);

    const chatList = this.chatService.findAllChatLog(classId);

    // 유저 리스트를 긁어서 보내줘야함 -> 접속한 사람을 room에서 보내줘야한다.
    const userList = this.chatService.findStudents(classId);
    const connectUsers = [];
    const sockets = await this.server.in(String(classId)).fetchSockets();

    sockets.forEach((s) => {
      connectUsers.push({ nickname: s.data.nickname, state: s.data.state });
    });

    // DB에서 찾은 학생목록과 지금 접속한 사람의 이름을 비교해 상태를 업데이트 한 후
    // FE에게 보내줘야한다.

    const dummy = [
      { nickname: '공정용', state: userState.disconnect },
      { nickname: '조상현부캐', state: userState.disconnect },
      { nickname: '문성현', state: userState.disconnect },
      { nickname: '조상현', state: userState.disconnect },
    ];

    return { nickname, userList: dummy, chatList, connectUsers };
  }

  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @ConnectedSocket()
    client: Socket,
    @MessageBody('classId')
    classId: string,
  ): object {
    const nickname = client.data.nickname;

    client.leave(classId);
    client.broadcast.to(classId).emit('leaveUser', nickname);

    Logger.debug(`leaveRoom / ${nickname}님이 ${classId}에서 퇴장했습니다.`);
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
      chatMessage: string;
    },
  ): object {
    const nickname = client.data.nickname;
    const { classId, chatMessage } = data;
    const id = uuid();

    Logger.debug(`sendChat / (room: ${classId}) ${nickname} : ${chatMessage}`);

    if (nickname === undefined || classId === undefined) {
      client.disconnect(true);
      Logger.debug(`닉네임 설정이 안 돼있네요. 아니면 방에 들어가질 않았어요.`);
      return;
    }

    this.chatService.saveChat(
      classId,
      nickname,
      chatMessage,
      id,
      chatType.common,
    );

    client.broadcast
      .to(String(classId))
      .emit('receiveChat', { id, chatMessage, nickname });
    return { id, chatMessage };
  }

  @SubscribeMessage('sendQuestion')
  handleQuestionMessage(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      chatMessage: string;
    },
  ): object {
    const nickname = client.data.nickname;
    const { classId, chatMessage } = data;
    const id = uuid();

    Logger.debug(
      `sendQuestion / (room: ${classId}) ${nickname} : ${chatMessage}`,
    );

    if (nickname === undefined || classId === undefined) {
      client.disconnect(true);
      Logger.debug(`닉네임 설정이 안 돼있네요. 아니면 방에 들어가질 않았어요.`);
      return;
    }

    this.chatService.saveChat(
      classId,
      nickname,
      chatMessage,
      id,
      chatType.question,
    );

    client.broadcast.to(String(classId)).emit('receiveQuestion', {
      id,
      chatMessage,
      nickname,
    });

    return { id, chatMessage };
  }

  @SubscribeMessage('sendResolved')
  handleQuestionSolve(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      chatId: string;
    },
  ): object {
    const { classId, chatId } = data;
    const nickname = client.data.nickname;

    const isWriter = this.chatService.checkWriter(classId, nickname, chatId);
    if (!isWriter) {
      client.disconnect(true);
      return;
    }

    client.broadcast.to(String(classId)).emit('receiveResolved', { chatId });
    return {};
  }

  @SubscribeMessage('reportUser')
  handleReportUser(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      nickname: string;
    },
  ): object {
    // 데이터베이스에 저장
    // 신고 기능
    return {};
  }

  @SubscribeMessage('changeMyState')
  handleReaction(
    @ConnectedSocket()
    client: Socket,
    @MessageBody()
    data: {
      classId: number;
      state: number;
    },
  ): object {
    const { classId, state } = data;
    const nickname = client.data.nickname;

    client.data.state = state;
    client.broadcast
      .to(String(classId))
      .emit('changeState', { nickname, state });
    Logger.debug(`changeMyState / ${nickname}이/가 ${state}로 변경`);
    return {};
  }

  handleConnection(@ConnectedSocket() client: Socket): void {
    Logger.debug(`${client.id}이 들어왔어요.`);
    return;
  }

  handleDisconnect(@ConnectedSocket() client: Socket): void {
    Logger.debug(`${client.data.nickname}이 떠났어요.`);
    return;
  }
}
