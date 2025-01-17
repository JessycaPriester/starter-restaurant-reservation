import React, {useEffect, useState} from "react";
import { useHistory, useParams } from "react-router-dom";
import { listReservations, updateTable, updateReservationStatus, listTables } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function SeatTable() {
    const [reservationsError, setReservationsError] = useState(null);
    const [reservation, setReservation] = useState(null);
    const [tableId, setTableId] = useState(null);
    const [table, setTable] = useState({})
    const [tables, setTables] = useState([])
    const [tablesError, setTablesError] = useState(null)


    // When the page is first rendered get the tables and set the tables state to these tables
    useEffect(() => {
        const abortController = new AbortController();
        setTablesError(null);

        listTables(abortController.signal)
            .then(setTables)
            .catch(setTablesError)

        return () => abortController.abort();
    }, [])

    // When tableId changes find the matching table in tables and set table to this table
    useEffect(() => {
        const tableMatch = tables.find((table) => Number(table.table_id) === Number(tableId))
        setTable(tableMatch)
    }, [tableId, tables])

    const params = useParams()

    // When the reservation id in the params changes
    // get all the reservations
    // find the reservation with the same id as the one in params
    // set reservation to the matching reservation
    // set the status to that reservations status
    useEffect(() => {
        const abortController = new AbortController();
        setReservationsError(null);
        
        listReservations(abortController.signal)
          .then((data) => {            
            const reservationMatch = data.find((reservation) => {
                return reservation.reservation_id === +params.reservation_id
            })            
            setReservation(reservationMatch)
          })
          .catch(setReservationsError);

    
        return () => abortController.abort();
      }, [params.reservation_id]);


    // INPUT CHANGE HANDLERS

    const handleTableChange = (event) => {
        setTableId(event.target.value)
    }

    const history = useHistory()

    // BUTTON HANDLERS


    function cancelHandler(){
        history.goBack();
    }

    // Updates the tables reservation id so it's occupied then returns to that reservations dashboard
    const submitHandler = async(event) => {
        event.preventDefault();

        const updatedTable = {
            data: {
                ...table,
                reservation_id: reservation.reservation_id,
            }
        }

        const abortController = new AbortController();

        try {
            await updateTable(tableId, updatedTable, abortController.signal)

            const newStatus = "seated"
            
            await updateReservationStatus(reservation.reservation_id, newStatus, abortController.signal)
            .then(response => {
                console.log('Reservation status updated successfully:', response);
            })
            .catch(error => {
                setReservationsError(error)
            });


            history.push(`/dashboard?date=${reservation.reservation_date}`)
        } catch (error) {
            setTablesError(error)
        }

        return () => abortController.abort();
    }



    return (
        <div>
            <form onSubmit={submitHandler}>
                <label htmlFor="table_id">Table Number</label>
                <select name="table_id" onChange={handleTableChange}>
                    <option value="">Select a Table</option>
                    {tables.map((table) => (
                        <option key={table.table_id} value={table.table_id}>{table.table_name} - {table.capacity}</option>
                    ))}
                </select>
                <button type="submit">Submit</button>
                <button type="button" onClick={(cancelHandler)}>Cancel</button>
            </form>
            <ErrorAlert error={reservationsError} />
            <ErrorAlert error={tablesError} />
        </div>
    )
}

export default SeatTable;