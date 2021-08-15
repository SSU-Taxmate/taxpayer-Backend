import React, { useState } from 'react';
import PropTypes from 'prop-types';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent'
import { Button } from '@material-ui/core';
import axios from 'axios';
import { useSelector } from 'react-redux';
import TextField from '@material-ui/core/TextField';

function AddDepositDialog() {
    const [data, setdata] = useState({})
    const [open, setOpen] = useState(false);
    let classData = useSelector(state => state.classInfo.classData);

    const handleOpen = () => {
        setOpen(true);
    };
    const handleClose = () => {
        setOpen(false);
    };
    const handleSubmit = (e) => {
        //e.preventDefault();
        console.log('submit!')
        const res={
            classId:classData.classId,
            ...data
        }
        axios.post(`/api/bank/deposits`,res)
            .then(function (response) {
                console.log(response);
            })
            .catch(function (error) {
                console.log(error);
            });
    };
    const onChange=(e)=>{
        console.log(data)
        setdata({...data,[e.target.id]:e.target.value})
    }
    return (
        <div>
            <button onClick={handleOpen} className='btn btn-outline-primary mb-3' style={{ width: '87%' }}>+</button>
            <Dialog aria-labelledby="depositAdd" open={open}>
                <DialogTitle id="depositAdd">예금 상품 추가</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <TextField
                            className="col m-1"
                            id="name"
                            label="상품명"
                            variant="outlined"
                            size="small"
                            onChange={onChange}
                        />
                        <TextField
                            className="col m-1"
                            id="description"
                            label="내용"
                            multiline
                            rows={2}
                            variant="outlined"
                            size="small"
                            onChange={onChange}

                        />
                        <TextField
                            className="col m-1"
                            id="interestRate"
                            label="만기시 이율(%)"
                            variant="outlined"
                            size="small"
                            onChange={onChange}

                        />
                        <TextField
                            className="col m-1"
                            id="minAmount"
                            label="최소 가입 금액"
                            variant="outlined"
                            size="small"
                            onChange={onChange}

                        />
                      <TextField
                            className="col m-1"
                            id="minDuration"
                            label="최소 가입 기간(일)"
                            variant="outlined"
                            size="small"
                            onChange={onChange}

                        />

                    </DialogContent>
                    <DialogActions>
                        <Button color="primary" onClick={handleClose} type="submit">추가</Button>
                        <Button color="primary" onClick={handleClose}>취소</Button>
                    </DialogActions>
                </form>

            </Dialog>
        </div>
    )
}

export default AddDepositDialog
