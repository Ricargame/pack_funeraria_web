import React, { useEffect, useRef, useContext, useState } from "react";

import { Mensaje } from "../mensajes";
import { Loader, Dimmer } from "semantic-ui-react";
import moment from "moment";

import axios from "axios";
import useTable from "../useTable";
import { TableBody, TableRow, TableCell } from "@material-ui/core";
import { formatMoneda, validaMonto, formatoMonto } from "../../util/varios";

function ReportesSemanal() {
  var op = require("../../modulos/datos");
  let token = localStorage.getItem("jwtToken");
  const user_id = JSON.parse(localStorage.getItem("user_id"));

  const [activate, setActivate] = useState(false);
  const [mensaje, setMensaje] = useState({
    mostrar: false,
    titulo: "",
    texto: "",
    icono: "",
  });

  console.log(user_id);
  const headCells = [
    {
      label: "Nombre del vendedor",
      textAlign: "center",
      backgroundColor: "#008674",
      color: "white",
    },
    {
      label: "Sucursal",
      textAlign: "center",
      backgroundColor: "#008674",
      color: "white",
    },
    {
      label: "Cantidad de contratos",
      textAlign: "center",
      backgroundColor: "#008674",
      color: "white",
    },

    {
      label: "Monto",
      textAlign: "center",
      backgroundColor: "#008674",
      color: "white",
    },

    {
      label: "Generar Reporte",
      textAlign: "center",
      backgroundColor: "#008674",
      color: "white",
    },
  ];

  const codigo = JSON.parse(localStorage.getItem("codigo"));
  const permiso = JSON.parse(localStorage.getItem("permiso"));
  const [idSucursal, setIdSucursal] = useState(0.0);
  const [operacion, setOperacion] = useState(0.0);
  const [mostrar, setMostrar] = useState(false);

  const [filterFn, setFilterFn] = useState({
    fn: (items) => {
      return items;
    },
  });

  const [records, setRecords] = useState([
    {
      idproducto: "",
      codigo: "",
      cantidad: "",
      producto: "",
      precio: "",
      iva: "",
      motoiva: "",
      descuento: "",
      total: "",
    },
  ]);

  const BCV = JSON.parse(localStorage.getItem("dolarbcv"));
  const txtDolar = useRef();
  const txtBs = useRef();

  const calcular = () => {
    const cantidadDolares = parseFloat(txtDolar.current.value);
    const precio = parseFloat(BCV);

    if (!isNaN(cantidadDolares) && !isNaN(precio)) {
      const total = cantidadDolares * precio;
      txtBs.current.value = total.toFixed(2).replace(".", ",");
    } else {
      txtBs.current.value = "0,00";
    }
  };
  const calcular2 = () => {
    const cantidadBsStr = txtBs.current.value.replace(",", "."); // Reemplaza la coma por punto
    const cantidadBs = parseFloat(cantidadBsStr);
    const precioDolar = parseFloat(BCV);

    if (!isNaN(cantidadBs) && !isNaN(precioDolar) && precioDolar !== 0) {
      const totalDolares = cantidadBs / precioDolar;
      txtDolar.current.value = totalDolares.toFixed(2).replace(".", ",");
    } else {
      txtDolar.current.value = "0,00";
    }
  };
  const handleInputMontoChange = (event) => {
    validaMonto(event);
    if (event.which === 13 || typeof event.which === "undefined") {
      if (
        event.target.value === "" ||
        parseFloat(
          event.target.value.trim().replace(".", "").replace(",", ".")
        ) === 0.0
      ) {
        event.target.value = "0,00";
      }
      event.target.value = formatoMonto(event.target.value);
      let char1 = event.target.value.substring(0, 1);
      let char2 = event.target.value.substring(1, 2);
      if (char1 === "0" && char2 !== ",") {
        event.target.value = event.target.value.substring(
          1,
          event.target.value.legth
        );
      }
    } else if (event.which === 46) {
      return false;
    } else if (event.which >= 48 && event.which <= 57) {
      return true;
    } else if (event.which === 8 || event.which === 0 || event.which === 44) {
      return true;
    } else return false;
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: "Chart.js Bar Chart",
      },
    },
  };

  const labels = [
    "Lunes",
    "Martes",
    "Miercoles",
    "Jueves",
    "Viernes ",
    "Sabado",
    "Domingo",
  ];

  const data = {
    labels,
    datasets: [
      {
        label: "Miembros",
        data: [12, 4, 34, 54, 7, 12, 78],
        backgroundColor: "rgb(149, 187, 227)",
      },
    ],
  };
  const { TblContainer, TblHead, recordsAfterPagingAndSorting, TblPagination } =
    useTable(records, headCells, filterFn);

  const imprimir = (id, desde, hasta) => (e) => {
    e.preventDefault();
    window.open(
      `${op.conexion}/reporte/reporteIngresoEgreso?Nombre=${id}&Desde=${desde}&Hasta=${hasta}`
    );
  };

  const selecionarRegistros = async () => {
    let endpoint = op.conexion + "/poliza/Semanal";
    console.log(endpoint);
    setActivate(true);
    let bodyF = new FormData();
    bodyF.append("Desde", desde.current.value);
    bodyF.append("Hasta", hasta.current.value);

    await fetch(endpoint, {
      method: "POST",
      body: bodyF,
    })
      .then((res) => res.json())
      .then((response) => {
        setActivate(false);
        console.log(response);
        setRecords(response);
      })
      .catch((error) =>
        setMensaje({
          mostrar: true,
          titulo: "Notificación",
          texto: error.res,
          icono: "informacion",
        })
      );
  };

  const handleSearch = (e) => {
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value === "") return items;
        else
          return items.filter((x) => {
            if (
              (x.sucursal_id !== null
                ? String(x.sucursal_id).includes(target.value)
                : 0) ||
              (x.sucursal_nombre !== null
                ? x.sucursal_nombre
                    .toLowerCase()
                    .includes(target.value.toLowerCase())
                : "")
            ) {
              return x;
            }
          });
      },
    });
  };

  console.log("estas en menu");

  const obtenerLunesDeEstaSemana = () => {
    const fechaActual = new Date();
    const diaSemanaActual = fechaActual.getDay();
    const diasHastaLunes = diaSemanaActual === 0 ? 1 : 1 - diaSemanaActual;
    const fechaLunes = new Date(fechaActual);
    fechaLunes.setDate(fechaActual.getDate() + diasHastaLunes);

    // Formatea la fecha en "año-mes-día" usando moment
    console.log(moment(fechaLunes).format("YYYY-MM-DD"));
    return moment(fechaLunes).format("YYYY-MM-DD");
  };

  // Función para obtener la fecha del sábado de la semana actual
  const obtenerSabadoDeEstaSemana = () => {
    const fechaLunes = new Date(obtenerLunesDeEstaSemana());
    const fechaSabado = new Date(fechaLunes);
    fechaSabado.setDate(fechaLunes.getDate() + 6); // Suma 5 días a partir del lunes
    // Formatea la fecha en "año-mes-día" usando moment
    console.log(moment(fechaSabado).format("YYYY-MM-DD"));
    return moment(fechaSabado).format("YYYY-MM-DD");
  };

  const desde = useRef(obtenerLunesDeEstaSemana());
  const hasta = useRef(obtenerSabadoDeEstaSemana());

  useEffect(() => {
    selecionarRegistros();
    obtenerLunesDeEstaSemana();
    obtenerSabadoDeEstaSemana();
  }, []);

  const regPre = () => {
    setMostrar(true);
    setMensaje({ mostrar: false, titulo: "", texto: "", icono: "" });
  };

  const gestionarBanco = (op, id) => (e) => {
    e.preventDefault();
    setMostrar(true);
    setOperacion(op);
    setIdSucursal(id);
  };
  return (
    <div className="col-md-12 mx-auto p-2">
      <div className="col-12 py-2">
        <div className="col-12 row d-flex justify-content-between py-2 mt-5 mb-3">
          <h2 className=" col-5 text-light">Lista De Vendedores Semanal</h2>
          <div class="input-group input-group-sm col-md-4 my-auto">
            <span
              class="input-group-text bg-transparent border-0 fw-bold text-light"
              id="inputGroup-sizing-sm"
            >
              Calcular $:
            </span>
            <input
              type="text"
              class="form-control bg-transparent text-light text-right"
              onChange={calcular}
              ref={txtDolar}
              aria-label="Sizing example input"
              placeholder="$"
              aria-describedby="inputGroup-sizing-sm"
            />
            <span
              class="input-group-text bg-transparent border-0 fw-bold text-light"
              id="inputGroup-sizing-sm"
            >
              Calcular BS:
            </span>
            <input
              type="text"
              class="form-control bg-transparent text-light text-right"
              ref={txtBs}
              onChange={calcular2}
              aria-label="Sizing example input"
              placeholder="BS"
              aria-describedby="inputGroup-sizing-sm"
            />
          </div>
        </div>
      </div>
      <div
        className="col-md-12 bg-light py-2 rounded"
        style={{ margin: "auto" }}
      >
        <div className="row col-12 d-flex justify-content-between mb-2">
          <input
            type="text"
            className=" col-3 form-control form-control-sm rounded-pill"
            onChange={handleSearch}
            placeholder="Buscar"
          />
          <input
            type="date"
            className=" col-3 form-control form-control-sm rounded-pill"
            ref={desde}
            defaultValue={moment(desde.current, "YYYY-MM-DD").format(
              "YYYY-MM-DD"
            )}
            onChange={(e) => (desde.current = e.target.value)}
          />
          <input
            type="date"
            className=" col-3 form-control form-control-sm rounded-pill"
            ref={hasta}
            defaultValue={moment(hasta.current, "YYYY-MM-DD").format(
              "YYYY-MM-DD"
            )}
            onChange={(e) => (hasta.current = e.target.value)}
          />
          <input
            value={"Buscar"}
            style={{ backgroundColor: "white", color: "black",  }}
            type="button"
            className=" col-2"
            placeholder="Buscar"
            onClick={selecionarRegistros}
          />
        </div>
        <TblContainer>
          <TblHead />
          <TableBody>
            {records &&
              recordsAfterPagingAndSorting().map((item, index) => (
                <TableRow key={index} style={{ padding: "0" }}>
                  <TableCell
                    className="align-baseline"
                    style={{ textAlign: "center", alignItems: "center" }}
                  >
                    {item.nombre_usuario}
                  </TableCell>
                  <TableCell
                    className="align-baseline"
                    style={{ textAlign: "center", alignItems: "center" }}
                  >
                    {item.nombre_sucursal}
                  </TableCell>
                  <TableCell
                    className="align-baseline"
                    style={{ textAlign: "center", alignItems: "center" }}
                  >
                    {item.cantidad_poliza_id}
                  </TableCell>
                  <TableCell
                    className="align-baseline"
                    style={{ textAlign: "center", alignItems: "center" }}
                  >
                    {item.total_monto_notas}
                  </TableCell>
                  <TableCell
                    className="align-baseline"
                    style={{
                      textAlign: "center",
                      alignItems: "center",
                      width: 130,
                    }}
                  >
                    <button
                      onClick={imprimir(
                        item.nombre_usuario,
                        desde.current.value,
                        hasta.current.value
                      )}
                      className="btn btn-sm mx-1 btn-warning rounded-circle"
                    >
                      <i className="fa fa-print"></i>
                    </button>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </TblContainer>
        <TblPagination />
      </div>

      <Dimmer active={activate} inverted>
        <Loader inverted>cargando...</Loader>
      </Dimmer>
      <Mensaje
        mensaje={mensaje}
        onHide={() =>
          mensaje.texto ===
          "Este Usuario No posee preguntas de seguridad debe registrarlas"
            ? regPre()
            : setMensaje({ mostrar: false, titulo: "", texto: "", icono: "" })
        }
      />
    </div>
  );
}

export default ReportesSemanal;
