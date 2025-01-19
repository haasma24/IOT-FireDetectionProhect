import React from "react";
import { Link } from "react-router-dom";
import "./fentre.css"
const Fenetre=()=>{
    return(<div className="fenetre">
        <Link to={"/manage/device"}>manage connected device</Link>
        <Link to={"/manage/agent"}>manage</Link>
    </div>)
}
export default Fenetre;