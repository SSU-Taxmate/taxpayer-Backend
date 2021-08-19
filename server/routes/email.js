const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const User = require('../models/user');
var appDir = path.dirname(require.main.filename);
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');


router.post('/', isNotLoggedIn, async(req, res, next) => {
    const email = req.body.email;
    const name = req.body.name;
    const sId = req.body.sId;
    const emailverify = req.body.emailverify;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    const entryCode = req.body.entryCode;

    console.log(req.body);
    console.log('넘어온 이메일:' + req.body.email);


    // 이미 가입된 이메일인지 확인
    try {
        const exUser = await User.findOne({ email: email }); // 이메일 중복 확인
        if (exUser) {
            console.log('이미 가입된 이메일입니다.');
            res.send('email_error=exist');
            // return res.status(403).send('error 설명 메시지');
            next(error);
        }

        let authNum = Math.random().toString().substr(2, 6); //인증번호
        let emailTemplete;

        ejs.renderFile(appDir + '/config/authemail.ejs', { authCode: authNum }, function(err, data) {
            if (err) { console.log(err) }
            emailTemplete = data;
        });
        //transport는 메일을 보낼 객체이다.
        let transporter = nodemailer.createTransport({
            service: 'Naver',
            // host: 'smtp.gmail.com', //호스트의 경우는 
            port: 587,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.NODEMAILER_USER, //메일 서버의 계정.
                pass: process.env.NODEMAILER_PASS,
            },
        });

        let mailOptions = ({
            from: 'TaxMate',
            to: email,
            subject: '회원가입을 위한 인증번호를 입력해주세요.',
            html: emailTemplete,
        });


        transporter.sendMail(mailOptions, function(emailError, info) {
            if (emailError) {
                console.log(emailError);
                console.log('메일 보내기 실패 in /email');
                next(emailError);
            } else {
                console.log("Finish sending email : " + info.response);
                res.send(authNum); // 인증번호
                // res.redirect( path.join(__dirname, '/signup'));
                transporter.close();
            }
        });
    } catch (error) {
        return res.status(403).send('This account does not exist');
        // return res.status(403).send('error 설명 메시지');
    }
});



module.exports = router;