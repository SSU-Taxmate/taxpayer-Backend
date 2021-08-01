const express = require('express');
const { Tax,SetTax } = require('../models/Tax');
const router = express.Router();
//create
router.post('/set-up', (req, res) => { 
  const nTax=new SetTax({setTax:req.body});
  

 nTax.save((err, doc) => {
    if (err) return res.json({ success: false, err });
    return res.status(200).json({
        success: true
    });
}); /**/
})
//read
router.get('/set-up', (req, res) => {
  SetTax.findOne().sort({date:-1}).exec((err,tax)=>{
    const result=tax
    if (err)return res.status(500).json({error: err});
    res.json(result)
  }) /**/
  })


module.exports = router;