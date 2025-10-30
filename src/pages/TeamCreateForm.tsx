import React, { useState, useEffect } from 'react';
import { TextField, Button, Box, Typography, Select, MenuItem, InputLabel, FormControl, Checkbox, ListItemText, OutlinedInput } from '@mui/material';
import { getActiveUsers } from 'api/user';
import { createTeam, updateTeam } from 'api/teams';

interface Props {
  team?: any;
  closeModal?: () => void;
}

const TeamCreateForm: React.FC<Props> = ({ team, closeModal }) => {
  const [name, setName] = useState(team?.Name || '');
  const [description, setDescription] = useState(team?.Description || '');
  const [department, setDepartment] = useState(team?.Department || '');
  const [region, setRegion] = useState(team?.Region || '');
  const [teamLeaderId, setTeamLeaderId] = useState<number | ''>(team?.TeamLeaderId || team?.TeamLeader?.Id || '');
  const [memberIds, setMemberIds] = useState<number[]>(team?.MemberIds || (team?.Members ? team.Members.map((m: any) => m.Id) : []));
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

    useEffect(() => {
      (async () => {
        const data = await getActiveUsers();
        console.log('Usuarios activos obtenidos:', data);
        setUsers(Array.isArray(data) ? data : []);
      })();
    }, []);

  useEffect(() => {
    if (team) {
      setName(team.Name || '');
      setDescription(team.Description || '');
      setDepartment(team.Department || '');
      setRegion(team.Region || '');
      setTeamLeaderId(team.TeamLeaderId || team.TeamLeader?.Id || '');
      setMemberIds(team.MemberIds || (team.Members ? team.Members.map((m: any) => m.Id) : []));
    }
  }, [team]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (team && team.Id) {
        // Editar equipo
        await updateTeam(team.Id, {
          Name: name,
          Description: description,
          Department: department,
          Region: region,
          TeamLeaderId: teamLeaderId || undefined,
          MemberIds: memberIds.length > 0 ? memberIds : undefined
        });
        setSuccess('Equipo actualizado correctamente');
      } else {
        // Crear equipo
        await createTeam({
          Name: name,
          Description: description,
          Department: department,
          Region: region,
          TeamLeaderId: teamLeaderId || undefined,
          MemberIds: memberIds.length > 0 ? memberIds : undefined
        });
        setSuccess('Equipo creado correctamente');
        setName(''); setDescription(''); setDepartment(''); setRegion(''); setTeamLeaderId(''); setMemberIds([]);
      }
      if (closeModal) closeModal();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Error al guardar el equipo');
    }
    setLoading(false);
  };

  return (
    <Box maxWidth={500} mx="auto" mt={4}>
      <Typography variant="h5" mb={2}>{team ? 'Editar Equipo' : 'Crear Equipo'}</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Nombre" value={name} onChange={e => setName(e.target.value)} required fullWidth margin="normal" />
        <TextField label="Descripción" value={description} onChange={e => setDescription(e.target.value)} fullWidth margin="normal" />
        <TextField label="Departamento" value={department} onChange={e => setDepartment(e.target.value)} fullWidth margin="normal" />
        <TextField label="Región" value={region} onChange={e => setRegion(e.target.value)} fullWidth margin="normal" />
        <FormControl fullWidth margin="normal">
          <InputLabel id="team-leader-label">Líder del equipo</InputLabel>
          <Select
            labelId="team-leader-label"
            value={teamLeaderId}
            onChange={e => setTeamLeaderId(Number(e.target.value))}
            input={<OutlinedInput label="Líder del equipo" />}
            displayEmpty
          >
            <MenuItem value=""><em>Sin líder</em></MenuItem>
            {(Array.isArray(users) ? users : []).map(u => (
              <MenuItem key={u.Id} value={u.Id}>{u.Name} {u.LastNAme}</MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth margin="normal">
          <InputLabel id="members-label">Miembros</InputLabel>
          <Select
            labelId="members-label"
            multiple
            value={memberIds}
            onChange={e => setMemberIds(typeof e.target.value === 'string' ? e.target.value.split(',').map(Number) : e.target.value)}
            input={<OutlinedInput label="Miembros" />}
            renderValue={selected => users.filter(u => selected.includes(u.Id)).map(u => u.Name).join(', ')}
          >
            {(Array.isArray(users) ? users : [])
              .filter(u => u.Id !== teamLeaderId)
              .map(u => (
                <MenuItem key={u.Id} value={u.Id}>
                  <Checkbox checked={memberIds.indexOf(u.Id) > -1} />
                  <ListItemText primary={`${u.Name} ${u.LastNAme}`} />
                </MenuItem>
              ))}
          </Select>
        </FormControl>
        {error && <Typography color="error" mt={2}>{error}</Typography>}
        {success && <Typography color="primary" mt={2}>{success}</Typography>}
        <Button type="submit" variant="contained" color="primary" fullWidth disabled={loading} sx={{ mt: 2 }}>
          {loading ? (team ? 'Guardando...' : 'Creando...') : (team ? 'Guardar Cambios' : 'Crear Equipo')}
        </Button>
      </form>
    </Box>
  );
};

export default TeamCreateForm;
