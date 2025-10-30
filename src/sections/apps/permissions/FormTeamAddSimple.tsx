import React from 'react';
import TeamCreateForm from '../../../pages/TeamCreateForm';

interface Props {
  team?: any;
  closeModal: () => void;
}

const FormTeamAdd: React.FC<Props> = ({ team, closeModal }) => {
  // Si hay un equipo, pasar los datos al formulario para edición
  return <TeamCreateForm team={team} closeModal={closeModal} />;
};

export default FormTeamAdd;
