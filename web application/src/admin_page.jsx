import React from "react";
import { db } from "./firebase-config";
import { collection, addDoc ,query, where, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./admin.css"
import Fenetre from "./fenetre";
const Admin_page = () => {
    const [formdata, setformdata] = useState({
        Password: ""
    });
    const [isvisible, setisvisible] = useState(false);

    const navigate = useNavigate();
    const [message, setMessage] = useState("");
    const checkAdmin = async (password) => {
        console.log(password)
        try {
            const q = query(
                collection(db, "secret-pass"),
                where("password", "==", password)
            );

            const querySnapshot = await getDocs(q);

            if (!querySnapshot.empty) {
                querySnapshot.forEach((doc) => {
                    if (doc.data().password === password) {
                        setisvisible(true);
                    }
                });
            } else {
                setMessage("You can't access this page");
            }
        } catch (e) {
            setMessage("Error checking admin:" + e.message);
            console.error(e);
        }
    };

    return (
        <div>
            {isvisible && <Fenetre />}
            <div className="signin_admin">
                <form onSubmit={(e) => {
                    e.preventDefault();
                    checkAdmin(formdata.Password);
                }}>
                    <section>
                        <label id="Password">Password</label>
                        <input
                            id="Password"
                            type="password"
                            value={formdata.Password}
                            onChange={(e) => { setformdata({ ...formdata, Password: e.target.value }) }}
                        />
                    </section>
                    <button type="submit">Send</button>
                </form>
                {message && <p>{message}</p>}
            </div>
        </div>
    );
}

export default Admin_page;