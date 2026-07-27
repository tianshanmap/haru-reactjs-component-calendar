import { Link } from 'react-router-dom';
function Header(){
    return(
        <div className="header">
            <Link to="/">Home</Link>
            <Link to="/appointment-manager">Appointment Manager</Link>
        </div>
    )
}
export default Header