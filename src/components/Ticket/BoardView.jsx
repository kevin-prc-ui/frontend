import React from "react";
import Card from "./Card";

const BoardView = ({ tickets, fetchTickets, }) => {
  // En tu componente padre
  const handleTicketStatusChange = () => {
    // Actualizar la lista de tickets
    fetchTickets();
  };

  const handleTicketDelete = (ticketId) => {
    // Eliminar el ticket de la lista local
    setTickets(tickets.filter((t) => t.id !== ticketId));
  };

  return (
    <div className=" w-full pb-2 pt-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 2xl:gap-5">
      {tickets.map((ticket) => (
        <Card
          ticket={ticket}
          onTicketStatusChange={handleTicketStatusChange}
          onTicketDelete={handleTicketDelete}
        />
      ))}
    </div>
  );
};

// Add prop type validation

export default BoardView;
