import React, { useEffect, useState } from 'react'
import ChartPie from '../../../../components/Charts/Pie';
import { useSelector } from "react-redux";
import moment from 'moment-timezone';
import Loading from '../../../../components/Loading'
import Error from '../../../../components/Error'

import axios from 'axios'
function ByType() {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    //bytype
    const [datalabel, setdatalabel] = useState()
    const [data, setdata] = useState();
    const [countdata, setcountdata] = useState();
    const [sumdata, setsumdata] = useState();

    const joinedUser = useSelector(state => state.classUser);
    const [startdate, setstartdate] = useState(moment().subtract(7, 'd').format('YYYY-MM-DD'));//7일전내역까지
    const [enddate, setenddate] = useState(moment().format('YYYY-MM-DD'));//현재날짜
    const fetchData = async () => {
        setIsError(false);
        setIsLoading(true);
        try {
            const result = await axios.get(`/api/students/${joinedUser.classUser}/account/statistics`,
                {
                    params: {
                        startDate: startdate,
                        endDate: moment(enddate).add(1, 'd').format('YYYY-MM-DD'),
                        type:'bytype'
                    }
                })
            console.log("/api/students/:id/statistics", result.data);

            setdata(result.data)
            setsumdata(result.data.map((v, i) => v.sum))
            setcountdata(result.data.map((v, i) => v.count))
            setdatalabel(result.data.map((v, i) => v._id))

        } catch (error) {
            setIsError(true);
        }
        setIsLoading(false);
    };
    useEffect(() => {
        fetchData();
    }, [])

    const handlestartdate = (e) => {
        setstartdate(e.target.value)
    }
    const handleenddate = (e) => {
        setenddate(e.target.value)
    }
    const onhandleclick = (e) => {
        fetchData();
    }
    const bank_pie_data = [{
        labels: datalabel,
        datasets: [{
            label: '입/출금 내역',
            data: sumdata,
            backgroundColor: [
                'rgb(75, 192, 192)',
                'rgb(255, 205, 86)',
                'rgb(255, 99, 132)',
                'rgb(153, 102, 255)',
            ],
            hoverOffset: 4
        }]
    }];
    const pieChartField = React.useMemo(
        () => (
            <>
                {bank_pie_data.map((v, i) => {
                    return <ChartPie key={i}
                        id={`bank_pie_${i}`} title={v.datasets[0].label}
                        data={v} />
                })}
            </>
        ), [datalabel, sumdata]);
    return (
        <>
            <div style={{ textAlign: 'right' }}>
                <input id='startDate' defaultValue={startdate}
                    max={moment().format('YYYY-MM-DD')}
                    type='date' onChange={handlestartdate} style={{ marginRight: '3px' }}></input>
                <input id='endDate' defaultValue={enddate}
                    min={startdate} max={moment().format('YYYY-MM-DD')}
                    type='date' onChange={handleenddate} style={{ marginRight: '3px' }}></input>
                <button onClick={onhandleclick}>조회하기</button>
            </div>
            {isError && <Error></Error>}
            {isLoading ?
                <Loading /> : pieChartField}
        </>
    )
}

export default ByType
