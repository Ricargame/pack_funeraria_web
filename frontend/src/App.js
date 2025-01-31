import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "semantic-ui-css/semantic.min.css";
import { AuthProvider } from "./context/auth";
import Login from "./pages/Login";
import MenuImpuestoPP from "./pages/escritorio";
import "./Hero.css";
import { MensajeSiNo } from "./components/mensajesCerrar";
import { AuthContext } from "../src/context/auth";
import PaginaWeb from "./pages/paginaWeb";
import Galeria from "./pages/galeria";

function App(props) {
  const { user, logout } = useContext(AuthContext);

  const pathname = window.location.pathname;
  const [mensaje, setMensaje] = useState({
    mostrar: false,
    icono: "",
    titulo: "",
    texto: "",
  });

  let timer,
    currSeconds = 0;

  function resetTimer() {
    clearInterval(timer);

    currSeconds = 0;

    timer = setInterval(startIdleTimer, 1000);
  }

  window.onload = resetTimer;
  window.onmousemove = resetTimer;
  window.onmousedown = resetTimer;
  window.ontouchstart = resetTimer;
  window.onclick = resetTimer;
  window.onkeypress = resetTimer;

  function startIdleTimer() {
    currSeconds++;
    /*  console.log(currSeconds); */

    if (currSeconds === 180 && pathname !== "/login" && pathname !== "/") {
      setMensaje({
        mostrar: true,
        icono: "error",
        titulo: "Alerta",
        texto: "La Sesion expirara en 10 segundos ",
      });
    }

    if (currSeconds === 190 && pathname !== "/login" && pathname !== "/") {
      window.location.href = "/login";
      setMensaje({
        mostrar: false,
        icono: "",
        titulo: "",
        texto: "",
      });
    }
  }

  return (
    <div>
      <MensajeSiNo
        mensaje={mensaje}
        onHideSi={() => {
          window.location.href = "/login";
        }}
        onHideNo={() => {
          setMensaje({
            mostrar: false,
            icono: "",
            titulo: "",
            texto: "",
          });
        }}
      />
      
        <AuthProvider>
          <Router>
          <Route exact path="/" component={Login} /> 


            {pathname !== "/"  && (
              <div>
                <MenuImpuestoPP />
              </div>
            )}
          </Router>
        </AuthProvider>
    
    </div>
  );
}

export default App;
