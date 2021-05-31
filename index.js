//backend 시작점
const express = require('express')
const app = express()
const port = 5000
const bodyParser = require('body-Parser');
const cookieParser = require('cookie-parser');
const { auth } = require('./server/middleware/auth');
const { User } = require('./server/models/User');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

const config = require('./server/config/key')
const mongoose = require('mongoose')
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false
}).then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err))


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/api/hello', (req, res) => {
  res.send("asdf")
})
app.get('/api/tax/nation', (req, res) => {

  res.json({
    "rows": [
      [
        "2011/04/25",
        "Tiger Nixon",
        "5421",
        "$320,800"
      ],
      [
        "2011/07/25",
        "Garrett Winters",
        "8422",
        "$170,750"
      ],
      [
        "2009/01/12",
        "Ashton Cox",
        "1562",
        "$86,000"
      ]],
    'columns': [{ "title": '날짜' }, { "title": '이유' }, { "title": 'dmdkr' }, { "title": '번호' }],

  })
})

app.get('/api/stats/nation', (req, res) => {

  res.json({
    "rows": [
      [
        "2011/04/25",
        "일기",
        "EJ",
        "1",
        "O"
      ],
      [
        "2012/04/25",
        "줄넘기",
        "EJ",
        "1",
        "O"
      ],
      [
        "2012/04/25",
        "일기",
        "EJ",
        "1",
        "O"
      ],
      [
        "2011/04/25",
        "줄넘기",
        "EJ",
        "1",
        "O"
      ],
      [
        "2011/04/25",
        "일기",
        "MH",
        "2",
        "X"
      ],

      [
        "2012/04/25",
        "줄넘기",
        "MH",
        "2",
        "O"
      ],
      [
        "2011/04/25",
        "일기",
        "SJ",
        "3",
        "O(쿠폰)"
      ],
      [
        "2011/04/24",
        "일기",
        "SA",
        "4",
        "O"
      ],
      [
        "2011/04/25",
        "일기",
        "SA",
        "4",
        "O"
      ],
      [
        "2011/04/25",
        "줄넘기",
        "SA",
        "4",
        "O"
      ]
    ],
    'columns': [{ "title": '날짜' }, { "title": '숙제종류' }, { "title": '이름' }, { "title": '번호' }, { "title": '제출여부' }],
  })
})

/**/
app.post('/api/users/register', (req, res) => {
  // 회원 가입할 때 필요한 정보들을 client가 넘겨주면,
  // 그것들을 데이터 베이스에 넣어 준다.
  const user = new User(req.body)
  user.save((err, userInfo) => {
    if (err) return res.json({ success: false, err })
    return res.status(200).json({
      success: true
    })
  })
})
app.post('/api/users/login', (req, res) => {
  //요청된 이메일을 데이터베이스에서 있는지 찾는다.
  User.findOne({ email: req.body.email }, (err, user) => {
    if (!user) {
      return res.json({
        loginSuccess: false,
        message: "제공된 이메일에 해당하는 유저가 없습니다."
      })
    }
    //요청된 이메일이 데이터베이스에 있다면, 비밀번호가 맞는 비밀번호인지 확인.
    user.comparePassword(req.body.password, (err, isMatch) => {
      if (!isMatch)
        return res.json({ loginSuccess: false, message: "비밀번호가 틀렸습니다." })
      //비밀번호까지 맞다면, token생성        
      user.generateToken((err, user) => {
        if (err) return res.status(400).send(err);
        //token을 저장한다. 쿠키, 로컬스토리지
        res.cookie("x_auth", user.token)
          .status(200)
          .json({ loginSuccess: true, userId: user._id })
      })
    })

  })
})
app.get('/api/users/auth', auth, (req, res) => {//auth라는 미드웨어(request받은값~<사이>~callback함수)
  //미들웨어에서 잘 통과한 경우 : authentication이 true라는 말.
  res.status(200).json({
    _id: req.user._id,
    //role이 0이면, 일반 유저, role이 0이 아니면, 관리자
    isAdmin: req.user.role === 0 ? false : true,
    isAuth: true,
    email: req.user.email,
    name: req.user.name,
    lastname: req.user.lastname,
    role: req.user.role,
    image: req.user.image
  })
})
app.get('/api/users/logout', auth, (req, res) => {
  User.findOneAndUpdate({ _id: req.user._id },
    { token: "" },
    (err, user) => {
      if (err) return res.json({ success: false, err });
      return res.status(200).send({
        success: true
      })
    })
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
