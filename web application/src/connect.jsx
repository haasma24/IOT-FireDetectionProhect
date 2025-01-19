import React from "react";
import "./Connect.css"
import logo from "./assets/logo.jpg"
import { useState } from "react";
import { db } from "./firebase-config";
import { collection, addDoc ,query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
const Connect =()=>{
    const [status,setstatus]=useState("logo");
    const [showsign,setshowsign]=useState(false);

    const [formdata, setformdata] = useState({
        Nom: "",
        Prenom: "",
        Telephone: "",
        Email: "",
        Password: "",
        Cv:null,
        Status:false,
        Role:"agent"
    });

    const [user,setuser]=useState();
    const [found,setfound]=useState(false);
    const navigate = useNavigate();
    const [message, setMessage] = useState("");

    const addData = async (formdata) => {
        try {
            const docRef = await addDoc(collection(db, "users"), formdata);
            setMessage('Signed up successfully , wait for the admin to approve tour request ');
        } catch (e) {
            setMessage("Error adding document: " + e.message);
            console.log(message);
        }
    };
    const checkUser = async (email, password) => {
        console.log(email , password)
        try {
            const q = query(
                collection(db, "users"),
                where("Email", "==", email),
                where("Password", "==", password)
            );
    
            const querySnapshot = await getDocs(q);
    
            if (!querySnapshot.empty) {
                // Récupérer les informations du document trouvé
                querySnapshot.forEach((doc) => {
                    setuser( doc.data());
                    if(doc.data().Role=="admin" && doc.data().Status){
                        navigate("/admin", { state: doc.data() });
                    }
                    else if(doc.data().Role=="agent" && doc.data().Status){
                        navigate("/agent", { state:{ data:doc.data(),id: doc.id} });
                    }
                });
            } else {
                setMessage("No user found with the provided email and password.");
            }
        } catch (e) {
            setMessage("Error checking user: " + e.message);
            console.error(e);
        }
    };
    
    return(
        <div className="Connect_screen">
            <section className="Connect_container">
                <section onMouseEnter={()=>{setshowsign(true)}} onMouseLeave={()=>{setshowsign(false)}}>
                <button className="Connection"  ><h1>Connect</h1></button>
                {
                    showsign && (<div className="Sign">
                        <button onClick={()=>{setstatus("sign up")}} >Sign up</button>
                        <button  onClick={()=>{setstatus("sign in")}} >Sign in</button>
                    </div>)
                }
                </section>
                {
                    status ==="logo" && (<div><img src={logo} alt="logo"></img>
                    <button className="about_us" onClick={()=>{if(status==="logo"){setstatus("description")}else{setstatus("logo")}}}>About us</button>
                    </div>)
                }
                {
                    status ==="description" && (<div>
                        <p className="Connect_description">
                        This system aims to automatically detect potential fires by analyzing environmental factors such as temperature, humidity, and gas levels, and to send alerts to relevant authorities without human intervention.
                        Additionally, the system will incorporate a centralized dashboard, accessible through a mobile application or a web interface, enabling users to visualize real-time data and receive notifications.
                        To ensure seamless data handling and real-time updates, the project employs Firebase as the backend database, which is well-suited for real-time data synchronization. 
                        This project seeks not only to enhance the efficiency of forest fire detection but also to contribute to global efforts in environmental conservation and disaster management through the use of cutting-edge IoT technologies.  
                        </p>)
                        <button className="about_us" onClick={()=>{if(status==="logo"){setstatus("description")}else{setstatus("logo")}}}>About us</button>
                    </div>)
                        
                }
                {
                    status  ==="sign in" && (<div>
                        <form onSubmit={(e)=>{
                            e.preventDefault();
                            checkUser(formdata.Email,formdata.Password)
                        }
                        }
                            >
                            <section>
                            <label id="Email" >Email</label>
                            <input id="Email" type={"email"} value={formdata.Email} onChange={(e)=>{setformdata({...formdata, Email: e.target.value})}}></input>
                            </section>
                            <section>
                            <label id="Password" >Password</label>
                            <input id="Password" type="password" value={formdata.Password} onChange={(e)=>{setformdata({...formdata, Password: e.target.value})}}></input>
                            </section>
                            <button type="submit">Send</button>
                        </form>
                        {message && <p>{message}</p>}
                    </div>)
                }
                {
                    status==="sign up" && (<div>
                         <form onSubmit={(e) => {
                        setstatus("sign in")
                        addData(formdata); // Envoi des données à Firebase
                        }}>
                            <section>
                            <label id="Nom" >Nom</label>
                            <input id="Nom" type={"text"} value={formdata.Nom}
                            onChange={(e) => setformdata({...formdata, Nom: e.target.value})}></input>
                            </section>
                            <section>
                            <label id="Prenom" >Prenom</label>
                            <input id="Prenom" type={"text"} value={formdata.Prenom}
                             onChange={(e) => setformdata({...formdata, Prenom: e.target.value})}></input>
                            </section>
                            <section>
                            <label id="Telephone" >Telephone</label>
                            <input id="Telephone" type={"tel"} value={formdata.Telephone}
                             onChange={(e) => setformdata({...formdata, Telephone: e.target.value})}></input>
                            </section>
                            <section>
                            <label id="Email" >Email</label>
                            <input id="Email" type={"email"} value={formdata.Email}
                            onChange={(e) => setformdata({...formdata, Email: e.target.value})}></input>
                            </section>
                            <section>
                            <label id="Password" >Password</label>
                            <input id="Password" type="password" value={formdata.Password}
                            onChange={(e) => setformdata({...formdata, Password: e.target.value})}></input>
                            </section>
                            <section>
                            <label id="Cv" >Upload Cv</label>
                            <input id="Cv" type="file" value={formdata.Cv}
                            onChange={(e) => setformdata({...formdata, Cv: e.target.value})}></input>
                            </section>
                            <button type="submit">Send</button>
                        </form>
                    </div>)
                }
            </section>
        </div>
    );
}
export default Connect;