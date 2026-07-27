import { useState,useEffect} from "react"
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import enUS from 'date-fns/locale/en-US';

// 1. Import the mandatory global CSS styles
import 'react-big-calendar/lib/css/react-big-calendar.css';
import NativeTimePicker from './time_picker';
import api from 'haru-service-api';

// 4. Render the component within a height-defined container
const AppointmentCalendar = ({name})=> {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
  const [currentSlot, setCurrentSlot] = useState("");
  const [isCalendarOpen,setIsCalendarOpen] = useState(true);
  const [isAppointmentOpen,setIsAppointmentOpen] = useState(false);
  const [eventList,setEventList] = useState([]);
  // 2. Configure the date localizer
  const locales = {
    'en-US': enUS,
  };

  const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
  });

  const getDate = (start_date,start_time) => {
    //start_date : 2026-07-02
    //start_time : 05:20
    //end_time : 07:20
    //start: new Date(2026, 6, 27, 10, 0), // July 27, 2026, 10:00 AM
    const yyyy = start_date.substring(0,4);
    const mm = Number(start_date.substring(5,7)) - 1;
    const dd = Number(start_date.substring(8,10));
    const hh = Number(start_time.substring(0,2));
    const minutes = Number(start_time.substring(3,5))
    return new Date(yyyy,mm,dd,hh,minutes);
  }

  const updateEventList = async (name,start_month) => {
      try {
        const result = await api.listAppointmentsByMonth(name,start_month);
        if (result.length > 0){
          const list = result.map(x => {
            return {
              title: x.event,
              start: getDate(x.start_date,x.start_time),
              end: getDate(x.start_date,x.end_time),
              allDay: false,
            }
          });
          setEventList(list);
        }
      } catch (err) {
        setError(err.message);
        console.log(err.message);
      }
  }

  useEffect(() => {
      // 1. Declare the inner async function
      const fetchData = async () => {
        const date = new Date(); // e.g., Mon Jul 27 2026
        const yyyymm = date.toISOString().slice(0, 7);
        await updateEventList(name,yyyymm);
      };
      // 2. Invoke the function immediately
      fetchData();
  }, []); 

  const handleSelectSlot = (slotInfo) => {
      setCurrentSlot(slotInfo.start);
      setIsAppointmentOpen(true);
      setIsCalendarOpen(false);
  };

  const handleBack = async () => {
    const yyyymm = JSON.stringify(currentSlot).substring(1,8)
    console.log("handleBack,yyyymm=" + yyyymm);
    await updateEventList(name,yyyymm);
    setIsAppointmentOpen(false);
    setIsCalendarOpen(true);
  }

  const format_date = (year,month) => {
    if (month < 10){
      return year + "-0" + month; 
    } else {
      return year + "-" + month;
    }
  }

  const handleNavigate = async (newDate,view,action) => {
    const year = newDate.getFullYear();
    const month = newDate.getMonth() + 1;
    const year_month = format_date(year,month);
    // console.log("handleNavigate year=" + year);
    // console.log("handleNavigate month=" + month);
    // console.log("handleNavigate newDate=" + year_month);
    // console.log("handleNavigate newDate.getMonth=" + newDate.getMonth());
    // console.log("handleNavigate newDate-type=" + typeof(newDate));
    // console.log("handleNavigate view=" + view);
    // console.log("handleNavigate action=" + action);
    setCurrentDate(newDate);
    await updateEventList(name,year_month);
  }
  return (
    <>
    {isAppointmentOpen &&
      <NativeTimePicker name={name} slotInfo={currentSlot} onExit={handleBack}/>      
    }
    {isCalendarOpen &&
      <div style={{ height: '800px' }}>
        <Calendar
          localizer={localizer}
          selectable={true}
          onSelectSlot={handleSelectSlot}
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={(newView) => setCurrentView(newView)}
          events={eventList}
        />
      </div>
    }
    </>
  );
}

export default AppointmentCalendar;
