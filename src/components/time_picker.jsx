import { useState,useEffect } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import dayjs from 'dayjs';
import styles from './time_picker.module.css';
import api from 'haru-service-api';

export default function NativeTimePicker({name,slotInfo,onExit}) {
  const [list, setList] = useState(
    [
    ]    
  );
  const [startDate,setStartDate] = useState(JSON.stringify(slotInfo).substring(1,11))
  const [startTime, setStartTime] = useState(dayjs());
  const [endTime, setEndTime] = useState(dayjs());
  const [data, setData] = useState("");

  useEffect(() => {
      // 1. Declare the inner async function
      const fetchData = async () => {
        try {
          const yyyymmdd = JSON.stringify(slotInfo).substring(1,11)
          const result = await api.listAppointments(name,yyyymmdd);
          setList(result);
          console.log(result);
        } catch (err) {
          setError(err.message);
          console.log(err.message);
        }
      };
      // 2. Invoke the function immediately
      fetchData();
  }, []); 

  const toEasternTime = (time) => {

    const timeStr = JSON.stringify(time);
    console.log("toEasternTime=" + timeStr);
    const date = new Date(timeStr);

    const easternTimeStr = date.toLocaleString("en-US", {
      timeZone: "America/New_York"
    });    
    return easternTimeStr;
  }

  const onDataChange = (event) => {
    setData(event.target.value);  
  }
  const onAdd = async (event) => {
    const newUser = { 
      name: name,
      start_date: startDate,
      start_time: startTime.format("HH:mm"), 
      end_time: endTime.format("HH:mm"), 
      event: data 
    };
    const response = await api.createAppointment(newUser);
    setList(response);
  }
  const onDelete = async (event) => {
    const response = await api.deleteAppointmentByDatetime(name,startDate,event.target.getAttribute("name"));
    setList(response);
  }
  const onDeleteAll = async (event) => {
    const response = await api.deleteAppointmentByDate(name,startDate);
    setList(response);
  }
  return (
    <div className={styles.time_picker_top}>
      <div className={styles.time_picker_time_container}>
        <div>
          Selected Date : {startDate}        
        </div>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <TimePicker
            label="Start Time"
            value={startTime}
            onChange={(newValue) => setStartTime(newValue)}
          />
          <TimePicker
            label="End Time"
            value={endTime}
            onChange={(newValue) => setEndTime(newValue)}
          />
        </LocalizationProvider>
        <input type="text" value={data} onChange={onDataChange} />
        <button onClick={onAdd}>Add</button>
        <button onClick={onDeleteAll}>Delete</button>
        <button onClick={onExit}>Back</button>
      </div>
      <div>
       <table>
          <thead>
            <tr>
              <th>Start</th>
              <th>End</th>
              <th>Event</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {list.map((item) => (
              <tr>
                <td>{item.start_time}</td>
                <td>{item.end_time}</td>
                <td>{item.event}</td>
                <td>
                  <button name={item.start_time} onClick={onDelete} className={styles.link_button}>Delete</button>&nbsp;&nbsp;
                </td>
              </tr>
            ))}
          </tbody>
        </table>        
      </div>
    </div>
  );
}
