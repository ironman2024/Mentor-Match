import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell
} from '@mui/material';

const EventRegistrationsDialog: React.FC<{ registrations: any[]; onClose: () => void }> = ({ registrations, onClose }) => {
  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Registrations</DialogTitle>
      <DialogContent>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Team Name</TableCell>
              <TableCell>Team Leader</TableCell>
              <TableCell>Leader Email</TableCell>
              <TableCell>Team Members & Emails</TableCell>
              <TableCell>Registration Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {registrations.map((registration) => (
              <TableRow key={registration.teamName}>
                <TableCell>{registration.teamName}</TableCell>
                <TableCell>{registration.leader.name}</TableCell>
                <TableCell>{registration.leader.email}</TableCell>
                <TableCell>
                  {registration.members.length > 0
                    ? registration.members.map((member: any) => `${member.name} (${member.email})`).join(', ')
                    : 'No team members'}
                </TableCell>
                <TableCell>{new Date(registration.registeredAt).toLocaleDateString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default EventRegistrationsDialog;