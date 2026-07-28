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
  const [editStartTime, setEditStartTime] = useState("");
  const [data, setData] = useState("");
  const [info, setInfo] = useState("");
  const [isMainOpen, setIsMainOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);

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
  const onInfoChange = (event) => {
    setInfo(event.target.value);  
  }
  const onAdd = async (event) => {
    const newUser = { 
      name: name,
      start_date: startDate,
      start_time: startTime.format("HH:mm"), 
      end_time: endTime.format("HH:mm"), 
      event: data,
      info: info, 
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
  const onEdit = async (event) => {
    setIsMainOpen(false);
    setIsEditOpen(true);
    setEditStartTime(event.target.getAttribute("name"));
    setData(event.target.getAttribute("event"));
    setInfo(event.target.getAttribute("info"));
  }
  const onSave = async (event) => {
    const item = { 
      name: name,
      start_date: startDate,
      start_time: editStartTime, 
      end_time: endTime.format("HH:mm"), 
      event: data,
      info: info, 
    };
    const response = await api.updateAppointment(item);
    setList(response);
    setIsMainOpen(true);
    setIsEditOpen(false);
  }

  return (
    <>
    {isMainOpen &&
      <div className={styles.time_picker_top}>
        <div className={styles.time_picker_time_container}>
          <div className={styles.time_picker_current_time}>
            <scan>Current Date :</scan>
            <scan>{startDate}</scan>
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
          <button onClick={onExit}>Back</button>
        </div>
        <div className={styles.time_picker_time_container}>
          <div className={styles.time_picker_event}>
            <div className={styles.time_picker_input_event}>
              <label for="event">Event</label>
              <input id="event" type="text" value={data} onChange={onDataChange} width="50"/>
            </div>
            <div className={styles.time_picker_input_info}>
              <label for="info">Info</label>
              <input id="info" type="text" value={info} onChange={onInfoChange} />
            </div>
          </div>
          <div className={styles.time_picker_command}>
            <button onClick={onAdd}>Add</button>
            <button onClick={onDeleteAll}>Delete All Day</button>
          </div>
        </div>
        <div>
        <table>
            <thead>
              <tr>
                <th>Start</th>
                <th>End</th>
                <th>Who</th>
                <th>Event</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {list.map((item) => (
                <tr>
                  <td>{item.start_time}</td>
                  <td>{item.end_time}</td>
                  <td>{item.info}</td>
                  <td>{item.event}</td>
                  <td>
                    <button name={item.start_time} onClick={onEdit} event={item.event} info={item.info} className={styles.link_button}>Edit</button>&nbsp;&nbsp;
                    <button name={item.start_time} onClick={onDelete} className={styles.link_button}>Delete</button>&nbsp;&nbsp;
                  </td>
                </tr>
              ))}
            </tbody>
          </table>        
        </div>
      </div>
    }
    {isEditOpen &&
      <div className={styles.time_picker_top}>
        <div className={styles.time_picker_time_container}>
          <div className={styles.time_picker_current_time}>
            <scan>Current Date :</scan>
            <scan>{startDate}</scan>
          </div>
          <button onClick={onExit}>Back</button>
        </div>
        <div className={styles.time_picker_time_container}>
          <div className={styles.time_picker_event}>
            <div className={styles.time_picker_input_info}>
              <label for="info">Who</label>
              <input id="info" type="text" value={info} onChange={onInfoChange} />
            </div>
            <div className={styles.time_picker_input_event}>
              <label for="event">Event</label>
              <input id="event" type="text" value={data} onChange={onDataChange} width="50"/>
            </div>
          </div>
          <div className={styles.time_picker_command}>
            <button onClick={onSave}>Save</button>
          </div>
        </div>
      </div>
    }
    </>
  );
}
