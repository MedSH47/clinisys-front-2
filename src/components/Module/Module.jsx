// src/components/Module.jsx
import React, { useEffect, useState } from 'react';
import authService from '../../services/authService';
import 'bootstrap/dist/css/bootstrap.min.css';

const formatDate = (ts) => {
    if (!ts) return 'N/A';
    const d = new Date(Number(ts));
    return isNaN(d.getTime()) ? 'Invalid Date' : d.toISOString().split('T')[0];
};

const Module = () => {
    const [modules, setModules] = useState([]);
    const [form, setForm] = useState({ designation: '', code: '', creationUser: '' });
    const [editingId, setEditingId] = useState(null);

    useEffect(() => {
        loadModules();
    }, []);

    const loadModules = async () => {
        try {
            const data = await authService.getModules();
            setModules(data);
        } catch (e) {
            console.error('Failed to load modules', e);
        }
    };

    const resetForm = () => {
        setForm({ designation: '', code: '', creationUser: '' });
        setEditingId(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, creationDate: Date.now() };
        try {
            if (editingId) {
                await authService.updateModule(editingId, payload);
            } else {
                await authService.createModule(payload);
            }
            await loadModules();
            resetForm();
        } catch (err) {
            console.error('Save error', err);
        }
    };

    const handleEdit = (mod) => {
        setForm({
            designation: mod.designation,
            code: mod.code,
            creationUser: mod.creationUser,
        });
        setEditingId(mod.id);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this module?')) return;
        try {
            await authService.deleteModule(id);
            setModules((prev) => prev.filter((m) => m.id !== id));
        } catch (err) {
            console.error('Delete error', err);
        }
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Module Management</h2>

            <form onSubmit={handleSubmit} className="row g-3 mb-5">
                <div className="col-md-4">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Designation"
                        value={form.designation}
                        onChange={(e) => setForm({ ...form, designation: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-2">
                    <input
                        type="number"
                        className="form-control"
                        placeholder="Code"
                        value={form.code}
                        onChange={(e) => setForm({ ...form, code: e.target.value })}
                        required
                    />
                </div>
                <div className="col-md-3">
                    <select
                        disabled
                        className="form-select"
                        value={form.creationUser=localStorage.getItem('username')}
                        onChange={(e) => setForm({ ...form, creationUser: e.target.value })}
                        required>
                        <option value={form.creationUser} >
                            {localStorage.getItem('username')}
                        </option>
                    </select>
                </div>

                <div className="col-md-3">
                    <button type="submit" className="btn btn-primary me-2">
                        {editingId ? 'Update Module' : 'Add Module'}
                    </button>
                    {editingId && (
                        <button type="button" className="btn btn-secondary" onClick={resetForm}>
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <div className="table-responsive">
                <table className="table table-striped align-middle">
                    <thead className="table-dark">
                        <tr>
                            <th>ID</th>
                            <th>Designation</th>
                            <th>Code</th>
                            <th>Creation Date</th>
                            <th>Creation User</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {modules.map((mod) => (
                            <tr key={mod.id}>
                                <td>{mod.id}</td>
                                <td>{mod.designation}</td>
                                <td>{mod.code}</td>
                                <td>{formatDate(mod.creationDate)}</td>
                                <td>{mod.creationUser}</td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-warning me-2"
                                        onClick={() => handleEdit(mod)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(mod.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Module;
