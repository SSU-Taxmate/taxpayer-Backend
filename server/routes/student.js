/* base URL
  : /api/students
*/
const express = require('express');
const router = express.Router();
const { Account } = require('../models/Bank/Account');
const { AccountTransaction } = require('../models/Bank/AccountTransaction');
const { JoinedUser } = require('../models/JoinedUser');
const { GrantedHomework } = require('../models/Homework');
const { JoinDeposit } = require('../models/Bank/JoinDeposit');
const { StockAccount } = require('../models/Stock/StockAccount');
const { Stock } = require('../models/Stock/Stock');
/*
  [완료] 클래스 내 학생에 대한 모든 정보 - 학생 관리 테이블
  query{classId:} 로 class에 속한 학생의 userId, studentId는 아는 상황
*/
router.get('/', async (req, res) => {
    //console.log("classId:", req.query)
    try {
        // console.log("studentId:",req.params.id,req.query)
        const students = await JoinedUser.find(req.query, ["userId", "alias", "jobId"])
            .populate('userId', 'email name alias jobId').populate('jobId').exec()
        let result = await Promise.all(
            students.map(async (v, i) => {
                const account = await Account.findOne({ 'studentId': v._id })
                return {
                    '_id':v.userId._id,
                    'name': v.userId.name, 'email': v.userId.email,
                    'alias': v.alias, 'job': v.jobId, 'balance': account.currentBalance
                }
            })
        )
        res.json(result)
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
})

/*
  [완료] 클래스 내 학생에 대한 job 정보 - job 테이블
  query{classId:} 로 class에 속한 학생의 userId, studentId는 아는 상황
*/
router.get('/job', async (req, res) => {
    //console.log("classId:", req.query)
    try {
        // console.log("studentId:",req.params.id,req.query)
        const students = await JoinedUser.find(req.query, ["userId", "jobId"])
            .populate('userId').populate('jobId').exec()
        console.log(students)
        let result = await Promise.all(
            students.map(async (v, i) => {
                return {
                    'studentId': v.userId._id, 'name': v.userId.name, 'job': v.jobId
                }
            })
        )
        res.json(result)
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
})
/* 
   [완료] 클래스 내 한 학생의 job 삭제
*/
router.delete('/:id/jobs/:jobId', (req, res) => {
    const studentId = req.params.id
    const jobId = req.params.jobId
    //console.log(studentId,jobId)
    JoinedUser.updateOne({ _id: studentId }, { $pull: { jobId: jobId } }, (err, doc) => {
        if (err) return res.json({ success: false, err });
        return res.status(200).json({
            success: true
        })
    })
})

/*
  ====================== 계좌 정보, 거래 내역
*/
/*
  [정상] : 학생 자신의 기본 계좌 정보 가져오기
  : accountId 모르지만, studentId는 아는 상황
*/
router.get('/:id/account', (req, res) => {
    //console.log("studentId",req.params.id)
    Account.findOne({ studentId: req.params.id }, (err, doc) => {
        const result = doc
        if (err) return res.status(500).json({ error: err });
        res.json(result)
    })
})
/*
  [정상] : 학생 자신의 계좌 거래 내역보기
  {accountId:,startDate:,endDate:} <=studentId로 Account에서 찾을 수 있음
*/
router.get('/:id/account/history', async (req, res) => {
    try {
        // console.log("studentId:",req.params.id,req.query)
        const account = await Account.findOne({ studentId: req.params.id })
        //console.log(account)
        const accounttrans = await AccountTransaction.find(
            {
                accountId: account._id,
                date: { $gte: req.query.startDate, $lt: req.query.endDate }
            }).sort({ date: -1 })
        const result = accounttrans
        //console.log(result)
        res.json(result)
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }

})

/*
    [생각]자신 계좌의 통계정보 확인
    : 입/출금
*/
router.get('/:id/account/statistics', async (req, res) => {
    //console.log("studentId:", req.params.id, req.query)
    try {
        const studentId = req.params.id
        const account = await Account.findOne({ studentId: studentId })
        //console.log(account)
        let result;
        if (req.query.type === 'bytype') {
            const bytype = await AccountTransaction.aggregate([
                {
                    $match: {
                        "accountId": account._id,
                        "date": { $gte: new Date(req.query.startDate), $lt: new Date(req.query.endDate) }
                    }
                },
                {
                    $group:
                    {
                        _id: '$memo',
                        count: { $sum: 1 },
                        sum: { $sum: '$amount' }
                    }
                }
            ])
            result = bytype
        } else {
            //나중에 한번에 groupby할 수 있는 방법 찾기
            const bydatein = await AccountTransaction.aggregate([
                {
                    $match: {
                        "accountId": account._id,
                        'transactionType':0,
                        "date": { $gte: new Date(req.query.startDate), $lt: new Date(req.query.endDate) }
                    },

                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date"},//월단위 {$substr:['$date',5,2]}
                        sum: { $sum: '$amount' }
                    }
                }
            ])
            const bydateout = await AccountTransaction.aggregate([
                {
                    $match: {
                        "accountId": account._id,
                        'transactionType':1,
                        "date": { $gte: new Date(req.query.startDate), $lt: new Date(req.query.endDate) }
                    },

                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$date"},//월단위 {$substr:['$date',5,2]}
                        sum: { $sum: '$amount' }
                    }
                }
            ])
            result = {bydatein,bydateout}
        }
        res.json(result)
    } catch (err) {
        res.status(500).json({ success: false, error: err });
    }
})

/*
  ====================== 가입한 금융 상품
*/
/*
  [정상] : 가입한 상품 보여주세요 {studentId:}
  isClosed : false인 것만!
*/
router.get('/:id/deposit', (req, res) => {
    //console.log("studentId:", req.params.id)
    const studentId = req.params.id
    JoinDeposit.findOne({ studentId: studentId, isClosed: false }, ["productId", "amount", "createdAt"])
        .populate("productId").exec((err, data) => {
            const result = data
            //console.log("get:/students/deposit",result)
            if (err) return res.status(500).json({ error: err });
            res.json(result)
        })
})


/*
  [정상] [student] Student의 수행 여부 가져오기
  { studentId:joinedUser의 _id }로 GrantedHomework에서 찾는다. 
  homeworkId는 필요가 없다.
*/
router.get('/:id/homeworks', async (req, res) => {
    try {
        //console.log("studentId:",req.params.id)
        const studentId = req.params.id;
        const ghw = await GrantedHomework.find({ studentId: studentId })
            .populate({ path: 'homeworkId', select: ['name', 'detail', 'expDate'] })
        //console.log('Class숙제와 student의 제출여부\n',ghw)
        let result;
        result = ghw.map((v, i) => {
            return {
                homeworkId: v.homeworkId._id,
                name: v.homeworkId.name,
                detail: v.homeworkId.detail,
                expDate: v.homeworkId.expDate,
                submission: v.submission,
                withinDeadline: v.withinDeadline,
                coupon_id: v.coupon_id,
            }
        })
        //console.log(result)
        res.json(result)
    } catch (err) {
        res.json({ success: false, err })
    }
})

/*
    student가 구매한 모든 stock 보여주기
    : ByStudentStock이 이거 사용중
*/
router.get('/:id/stocks', async (req, res) => {
    console.log(req.params)
    const studentId = req.params.id;

    try {
        const userStocks = await StockAccount.findOne({ studentId: studentId })
        const holdingStocks = userStocks.holdingStocks
        let result = await Promise.all(
            holdingStocks.map(async (v, i) => {
                const stock = await Stock.findOne({ '_id': v.stockId })
                return {
                    stockId: v.stockId,
                    quantity: v.quantity,
                    allPayAmount: v.allPayAmount,
                    stockName: stock.stockName,
                    currentPrice: stock.prices[stock.prices.length - 1].value//현재가
                }
            })
        )
        //console.log('result',result)
        res.json(result)
    } catch (err) {
        res.json({ success: false, err })
    }
})
/*
    [완성]stuent 가 구매한 stock들에 대한 통계정보
*/
router.get('/:id/stocks/statistics',async (req, res) => {
    //console.log(req.params)
    const studentId = req.params.id;

    try {
        const userStocks = await StockAccount.findOne({ studentId: studentId })
        const holdingStocks = userStocks.holdingStocks
        //console.log('userStocks>>>\n',userStocks)
        let first = await Promise.all(
            holdingStocks.map(async (v, i) => {
                const stock = await Stock.findOne({ '_id': v.stockId })
                return {
                    stockId:v._id,
                    PayAmount:v.allPayAmount,//총매입
                    evaluated:stock.prices[stock.prices.length - 1].value*v.quantity,//총평가
                    //평가손익
                    evaluatedIncome:stock.prices[stock.prices.length - 1].value*v.quantity-v.allPayAmount
                }
            })
        )
        let allPayAmount=await first.reduce((v,c)=>v+c.PayAmount,0)
        let allEvaluated=await first.reduce((v,c)=>v+c.evaluated,0)
        let evaluatedIncome=allEvaluated-allPayAmount
        let evaluatedProfit=await Math.round(evaluatedIncome/allPayAmount*100)/100
        //console.log(first,allPayAmount,allEvaluated,evaluatedIncome,evaluatedProfit)
        /*
        {
            allPay:,//총매입 - allPayAmount 다 더하기
            allEvaluated:,//총평가 //currentPrice*quantity를 다더하기
            evaluatedIncome:,평가손익 총평가-총매입
            evaluatedProfit:,평가수익률//(총평가-총매입)/총매입*100
        }
        */
        res.json({allPay:allPayAmount,allEvaluated,evaluatedIncome,evaluatedProfit})
    } catch (err) {
        res.json({ success: false, err })
    }
})
module.exports = router;