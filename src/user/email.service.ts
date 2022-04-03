import Mail = require('nodemailer/lib/mailer');
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import * as config from 'config';
const emailConfig = config.get('email');

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private transporter: Mail;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: true,
      requireTLS: true,
      auth: {
        user: emailConfig.user,
        pass: emailConfig.pass,
      },
    });
  }
  async sendTempPassword(emailAddress, tempPassword) {
    const mailOptions: EmailOptions = {
      to: emailAddress,
      subject: '임시 비밀번호 메일',
      html: `
      <form>
      <div
        style="
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          width: 650px;
          padding: 50px;
          color: #000;
        "
      >
        <img
          src="https://user-images.githubusercontent.com/75469212/160877978-652c772a-171d-4d66-90d0-48e86eed3ef4.png"
          alt="큐"
        />
        <h1 style="font-size: 30px">임시 비밀번호를 확인해주세요.</h1>
        <p style="font-size: 18px">
          임시비밀번호로 가입 후 비밀번호 변경을 권장드립니다.
        </p>
        <div style="display: flex; align-items: center; justify-content: center;">
          <img
            src="https://user-images.githubusercontent.com/75469212/160877628-89232028-f499-49ec-b417-e67da60f6a50.png"
            alt="큐"
          />
          <div
            style="
              display: table;
              margin: 20px auto;
              width: 400px;
              height: 80px;
              color: #fff;
              background-color: #718AFF;
              border: none;
              border-radius: 7px;
              font-size: 24px;
              cursor: pointer;
            "
          >
            <div  style="
              display: table-cell;
              color: #fff;
              font-size: 24px;
              cursor: pointer;
              vertical-align: middle;
              text-align: center;
            ">
           ${tempPassword}
            </div>
          </div>
        </div>
      </div>
    </form>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendMemberJoinVerification(
    emailAddress: string,
    signupVerifyToken: string,
  ) {
    const baseUrl = emailConfig.baseUrl;

    const url = `${baseUrl}/user/email-verify?signupVerifyToken=${signupVerifyToken}`;

    const mailOptions: EmailOptions = {
      to: emailAddress,
      subject: '가입 인증 메일',
      html: `
      <form action="${url}" method="POST">
      <div
        style="
          font-family: 'Arial', sans-serif;
          font-weight: bold;
          width: 650px;
          padding: 50px;
          color: #000;
        "
      >
        <img
          src="https://user-images.githubusercontent.com/75469212/160877978-652c772a-171d-4d66-90d0-48e86eed3ef4.png"
          alt="큐"
        />
        <h1 style="font-size: 30px">큐!에 참여하시려면 이메일을 확인해주세요.</h1>
        <p style="font-size: 18px">
          마지막으로 이메일 확인을 해주시면 모든 회원가입 단계가 완료됩니다.
        </p>
        <div style="display: flex; align-items: center">
          <img
            src="https://user-images.githubusercontent.com/75469212/160877628-89232028-f499-49ec-b417-e67da60f6a50.png"
            alt="큐"
          />
          <button
            style="
              margin: 20px auto;
              width: 200px;
              height: 80px;
              color: #fff;
              background-color: #718aff;
              border: none;
              border-radius: 7px;
              font-size: 24px;
              cursor: pointer;
            "
          >
            이메일 확인
          </button>
        </div>
      </div>
    </form>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
