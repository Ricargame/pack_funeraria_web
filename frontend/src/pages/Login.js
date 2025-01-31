import React, { useContext, useRef, useState, useEffect } from "react";
import { AuthContext } from "../context/auth";
import { useForm } from "../util/hooks";
import axios from "axios";
import { MensajeAlert, MensajeMinimal } from "../components/Alerta";
import { Loader, Dimmer, Label } from "semantic-ui-react";
import md5 from "md5";
import { Mensaje } from "../components/mensajes";
import { GestionarPreguntas } from "../components/seguridad/preguntasSeguridad";
import { GestionarClave } from "../components/seguridad/cambiarClavePersonal";

function Login(props) {
  const [loading, setLoading] = useState(false);

  let op = require("../modulos/datos");
  const [bloquear, setBloquear] = useState(0);
  const context = useContext(AuthContext);
  const [activate, setActivate] = useState(false);

  const [token, setToken] = useState();
  const [idzona, setIdZona] = useState();
  const [mostrar, setMostrar] = useState(false);
  const [mensaje, setMensaje] = useState({
    mostrar: false,
    titulo: "",
    texto: "",
    icono: "",
  });

  const { onChange, onSubmit, values } = useForm(loginUserCallback, {
    username: "Admin",
    password: "1234",
  });

  useEffect(() => {
    context.logout();
  }, []);

  const txtUserName = useRef(null);
  const txtPassword = useRef(null);

  const bloquearUsuario = () => {
    let endpoint = `${op.conexion}/api/comun/bloquearusuario`;
    let body;

    body = {
      usuario: values.username.toLowerCase(),
    };

    axios
      .post(endpoint, body, {
        headers: {
          "x-access-token": `${token}`,
        },
      })
      .then(function (response) {
        if (response.status === 200) {
          setBloquear(1);
          setMensaje({
            mostrar: true,
            titulo: "Notificación",
            texto: "Por Razones de Seguridad su usuario a sido bloqueado",
            icono: "informacion",
          });
        }
        setActivate(false);
      })
      .catch(function (error) {
        setActivate(false);
        setMensaje({
          mostrar: true,
          titulo: "Error",
          texto:
            error.response.data.message ===
            "llave duplicada viola restricción de unicidad «persona_pkey»"
              ? "ya existe una persona con esa cedula"
              : error.response.data.message,
          icono: "error",
        });
      });
  };

  const sinIgn = async () => {
    let endpoint = op.conexion + "/Auth/login";
    console.log(endpoint);
    setActivate(true);
    var login = values.username;
    var password = values.password;

    // let body = {
    //   Usuario: login,
    //   Clave: passwd
    // }

    setLoading(false);

    let bodyF = new FormData();

    bodyF.append("Username", login);
    bodyF.append("Password", password);

    await fetch(endpoint, {
      method: "POST",
      body: bodyF,
    })
      .then((res) => res.json())
      .then((response) => {
        console.log(response.data.res.code);
        console.log(response.data.res.text);
        context.login(response.data.token);
        // window.location.href = '/inicio'
        const fecha = new Date();
        localStorage.setItem("fechasistema", JSON.stringify(fecha));

        setActivate(false);

        if (response.data.res.code == 200) {
          // localStorage.setItem(
          //   "rol",
          //   JSON.stringify(response.data.usuario[0].rol)
          // );
          localStorage.setItem(
            "user_id",
            JSON.stringify(response.data.usuario[0].user_id)
          );
          localStorage.setItem(
            "username",
            JSON.stringify(response.data.usuario[0].username)
          );
          localStorage.setItem(
            "permisos",
            JSON.stringify(response.data.usuario[0].permisos)
          );
          // localStorage.setItem(
          //   "idsucursal",
          //   JSON.stringify(response.data.usuario[1].id)
          // );
          // localStorage.setItem(
          //   "sucursal",
          //   JSON.stringify(response.data.usuario[1].name)
          // );
          
          setMensaje({
            mostrar: true,
            titulo: "Exito.",
            texto: response.data.res.text,
            icono: "exito",
          });

          window.location.href = "/inicio";
        }
        if (response.data.res.code == 400) {
          setMensaje({
            mostrar: true,
            titulo: "Error.",
            texto: response.data.res.text,
            icono: "error",
          });
        }
      })
      .catch((error) => {
        console.error(error);
        // setMensaje({
        //   mostrar: true,
        //   titulo: "Notificación",
        //   texto: error.res,
        //   icono: "informacion",
        // });
      });

    // axios
    //   .post(endpoint, body, {
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //   })
    //   .then(function (response) {
    //     console.log(response)
    //     if (response.status === 200) {
    //       console.log(response)
    //       /*context.login(response.data.token);
    //      if (response.data.token === null) {
    //        props.history.push("/");
    //      } else {
    //        setToken(response.data.token);

    //        localStorage.setItem(
    //          "fechasistema",
    //          JSON.stringify(response.data.fechasistema)
    //        );
    //        localStorage.setItem(
    //          "anioactu",
    //          JSON.stringify(response.data.anioactu)
    //        );
    //        localStorage.setItem(
    //          "idusuario",
    //          JSON.stringify(response.data.idusuario)
    //        );
    //
    //        localStorage.setItem(
    //          "codigo",
    //          JSON.stringify(response.data.codigo)
    //        );
    //        localStorage.setItem(
    //          "permiso",
    //          JSON.stringify(response.data.permiso)
    //        );
    //        localStorage.setItem("post", JSON.stringify(response.data));

    //      }*/
    //       console.log(response.data);
    //     }
    //   })
    //   .catch(function (error) {
    //     console.log(error)
    //   })
    //   .finally(function () {
    //     setLoading(false);
    //   });
  };

  function loginUserCallback() {
    setLoading(true);
    sinIgn();
    console.log("listo");
  }

  return (
    <div className="contenedor">
      <GestionarClave
        show={mostrar}
        onHideCancela={() => {
          setMostrar(false);
        }}
      />

      <Mensaje
        mensaje={mensaje}
        onHide={() => {
          parseInt(bloquear) === 3
            ? bloquearUsuario()
            : setMensaje({ mostrar: false, titulo: "", texto: "", icono: "" });
        }}
      />

       <div>
        <nav
          className="navbar navbar-expand-lg navbar-dark d-none d-lg-block"
          style={{ zIndex: 2000 }}
        >
          <div className="container-fluid d-flex justify-content-between">
            
            <a
              className="navbar-brand nav-link py-3"
              target="_blank"
              href="https://mdbootstrap.com/docs/standard/"
            >
              <strong> Funeraria</strong>
            </a>
            <button
              className="navbar-toggler"
              type="button"
              data-mdb-toggle="collapse"
              data-mdb-target="#navbarExample01"
              aria-controls="navbarExample01"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <i className="fas fa-bars" />
            </button>
            <div
              className="collapse navbar-collapse d-flex justify-content-end"
              id="navbarExample01"
            >
             
            </div>
          </div>
        </nav>

        <div id="intro" className="bg-image shadow-2-strong">
          <div
            className="mask d-flex align-items-center h-100"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
          >
            <div className="container">
              <div className="row justify-content-center">
                <div className="col-xl-5 col-md-5 px-5">
                  <form
                    className="bg-white  rounded-3 shadow-5-strong py-4 px-5 rounded"
                    onSubmit={onSubmit}
                  >
                    <div className="h-100 d-flex justify-content-center m-2">
                    <i class="fas fa-user-circle" style={{fontSize:'80px'}}></i>
                    </div>
              



                    <div class="mb-3">
                      <label class="form-label">Usuario</label>
                      <input
                          type="text"
                          class="form-control"
                          required
                          autoComplete="off"
                          name="username"
                          value={values.username}
                          onChange={onChange}
                        />
                    </div>

                    <div class="mb-3">
                      <label class="form-label">Contraseña</label>
                      <input
                          type="password"
                          class="form-control text-uppercase"
                          required
                          autoComplete="off"
                          name="password"
                          value={values.password}
                          onChange={onChange}
                          maxLength={10}
                        />

                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary btn-block rounded-pill"
                    >
                      Iniciar Sesion
                    </button>
                    <div className="col-md-12 mx-auto row mt-2">
                      <a
                        className="mx-auto col-md-7 text-center"
                        type="button"
                        href="#"
                        onClick={() => {
                          setMostrar(true);
                        }}
                      >
                        Recuperar Contraseña
                      </a>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
        <footer className="bg-light text-lg-start">
        
          <div
            className="text-center p-3"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
          >
            © 2020 Copyright:
            <a className="text-dark" href="https://mdbootstrap.com/">
              TechCode
            </a>
          </div>
        
        </footer>
      </div>
     
    </div>
  );
}

export default Login;
