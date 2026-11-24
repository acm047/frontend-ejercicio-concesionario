import { useEffect, useState } from 'react';

const URL = 'http://127.0.0.1:8000/api';

function App() {
  const [clientes, setClientes] = useState([]);
  const [coches, setCoches] = useState([]);
  const [revisiones, setRevisiones] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [cochesCliente, setCochesCliente] = useState([]);
  const [cochesRevision, setCochesRevision] = useState([]);

  const [cliente, setCliente] = useState({});
  const [coche, setCoche] = useState({});
  const [revision, setRevision] = useState({});
  const [foto, setFoto] = useState(null);

  const cargar = () => {
    fetch(URL + '/clientes').then(r => r.json()).then(setClientes);
    fetch(URL + '/coches').then(r => r.json()).then(setCoches);
    fetch(URL + '/revisiones').then(r => r.json()).then(setRevisiones);
  };

  useEffect(() => {
    cargar();
  }, []);

  const guardar = async (e, tipo, datos, id) => {
    e.preventDefault();

    const respuesta = await fetch(`${URL}/${tipo}${id ? '/' + id : ''}`, {
      method: id ? (tipo === 'revisiones' ? 'PATCH' : 'PUT') : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });

    if (!respuesta.ok) {
      alert('Error al guardar');
      return;
    }

    alert('Datos guardados');
    cargar();

    if (tipo === 'clientes') setCliente({});
    if (tipo === 'revisiones') setRevision({});
  };

  const guardarCoche = async (e) => {
    e.preventDefault();

    const datos = new FormData();

    ['marca', 'modelo', 'color', 'precio', 'cliente_id'].forEach(campo => {
      datos.append(campo, coche[campo]);
    });

    if (foto) datos.append('foto', foto);
    if (coche.id) datos.append('_method', 'PUT');

    const respuesta = await fetch(
      URL + '/coches' + (coche.id ? '/' + coche.id : ''),
      { method: 'POST', body: datos }
    );

    if (!respuesta.ok) {
      alert('Error al guardar el coche');
      return;
    }

    alert('Coche guardado');
    setCoche({});
    setFoto(null);
    cargar();
  };

  const eliminar = async (tipo, id) => {
    if (!confirm('¿Desea eliminar este registro?')) return;

    const respuesta = await fetch(`${URL}/${tipo}/${id}`, {
      method: 'DELETE'
    });

    if (!respuesta.ok) {
      alert('No se pudo eliminar');
      return;
    }

    alert('Registro eliminado');
    cargar();
  };

  const verHistorial = (id) => {
    fetch(`${URL}/coches/${id}/historial`)
      .then(r => r.json())
      .then(setHistorial);
  };

  const verCochesCliente = (id) => {
    fetch(`${URL}/clientes/${id}/coches`)
      .then(r => r.json())
      .then(setCochesCliente);
  };

  const verCochesRevision = () => {
    fetch(`${URL}/coches-revisiones`)
      .then(r => r.json())
      .then(setCochesRevision);
  };

  return (
    <div>
      <h1>Concesionario de Vehículos</h1>

      <h2>Clientes</h2>

      <form onSubmit={e => guardar(e, 'clientes', cliente, cliente.id)}>
        <input placeholder="Cédula" value={cliente.cedula || ''}
          onChange={e => setCliente({...cliente, cedula:e.target.value})} required />

        <input placeholder="Dirección" value={cliente.direccion || ''}
          onChange={e => setCliente({...cliente, direccion:e.target.value})} required />

        <input placeholder="Teléfono" value={cliente.telefono || ''}
          onChange={e => setCliente({...cliente, telefono:e.target.value})} required />

        <button>Guardar</button>
      </form>

      {clientes.map(c => (
        <p key={c.id}>
          {c.cedula} - {c.direccion} - {c.telefono}
          <button onClick={() => setCliente(c)}>Editar</button>
          <button onClick={() => eliminar('clientes', c.id)}>Eliminar</button>
          <button onClick={() => verCochesCliente(c.id)}>Ver coches</button>
        </p>
      ))}

      <h3>Coches por cliente</h3>

      {cochesCliente.map(c => (
        <p key={c.id}>{c.marca} - {c.modelo}</p>
      ))}

      <hr />

      <h2>Coches</h2>

      <form onSubmit={guardarCoche}>
        <input placeholder="Marca" value={coche.marca || ''}
          onChange={e => setCoche({...coche, marca:e.target.value})} required />

        <input placeholder="Modelo" value={coche.modelo || ''}
          onChange={e => setCoche({...coche, modelo:e.target.value})} required />

        <input placeholder="Color" value={coche.color || ''}
          onChange={e => setCoche({...coche, color:e.target.value})} required />

        <input type="number" placeholder="Precio" value={coche.precio || ''}
          onChange={e => setCoche({...coche, precio:e.target.value})} required />

        <select value={coche.cliente_id || ''}
          onChange={e => setCoche({...coche, cliente_id:e.target.value})} required>
          <option value="">Seleccione cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>{c.cedula}</option>
          ))}
        </select>

        <input type="file" accept="image/jpeg,image/png,image/webp"
          onChange={e => setFoto(e.target.files[0])} />

        <button>Guardar</button>
      </form>

      {coches.map(c => (
        <div key={c.id}>
          <p>{c.marca} - {c.modelo} - {c.color} - ${c.precio}</p>

          {c.foto && (
            <img src={`http://127.0.0.1:8000/storage/${c.foto}`} width="150" />
          )}

          <button onClick={() => { setCoche(c); setFoto(null); }}>Editar</button>
          <button onClick={() => eliminar('coches', c.id)}>Eliminar</button>
          <button onClick={() => verHistorial(c.id)}>Ver historial</button>
        </div>
      ))}

      <h3>Coches con revisiones</h3>

      <button onClick={verCochesRevision}>
        Consultar coches con revisiones
      </button>

      {cochesRevision.map(c => (
        <p key={c.id}>{c.marca} - {c.modelo}</p>
      ))}

      <hr />

      <h2>Revisiones</h2>

      <form onSubmit={e => guardar(e, 'revisiones', revision, revision.id)}>
        <input placeholder="Código" value={revision.codigo || ''}
          onChange={e => setRevision({...revision, codigo:e.target.value})} required />

        <label>
          <input type="checkbox" checked={!!revision.aceite}
            onChange={e => setRevision({...revision, aceite:e.target.checked})} />
          Aceite
        </label>

        <label>
          <input type="checkbox" checked={!!revision.filtro}
            onChange={e => setRevision({...revision, filtro:e.target.checked})} />
          Filtro
        </label>

        <label>
          <input type="checkbox" checked={!!revision.frenos}
            onChange={e => setRevision({...revision, frenos:e.target.checked})} />
          Frenos
        </label>

        <select value={revision.coche_id || ''}
          onChange={e => setRevision({...revision, coche_id:e.target.value})} required>
          <option value="">Seleccione coche</option>
          {coches.map(c => (
            <option key={c.id} value={c.id}>{c.marca} {c.modelo}</option>
          ))}
        </select>

        <button>Guardar</button>
      </form>

      {revisiones.map(r => (
        <p key={r.id}>
          {r.codigo} - Aceite: {r.aceite ? 'Sí' : 'No'} -
          Filtro: {r.filtro ? 'Sí' : 'No'} - Frenos: {r.frenos ? 'Sí' : 'No'}

          <button onClick={() => setRevision(r)}>Editar</button>
          <button onClick={() => eliminar('revisiones', r.id)}>Eliminar</button>
        </p>
      ))}

      <h2>Historial de revisiones</h2>

      {historial.map(r => (
        <p key={r.id}>
          {r.codigo} - Aceite: {r.aceite ? 'Sí' : 'No'} -
          Filtro: {r.filtro ? 'Sí' : 'No'} -
          Frenos: {r.frenos ? 'Sí' : 'No'}
        </p>
      ))}
    </div>
  );
}

export default App;
