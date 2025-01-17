import React, {useState} from "react";
import { useHistory } from "react-router-dom";
import { createTable } from "../utils/api";
import ErrorAlert from "../layout/ErrorAlert";

function CreateTable({setTables}) {
    const history = useHistory();

    const [ table_name, setTableName ] = useState("");
    const [ capacity, setCapacity ] = useState(1);
    const [error, setError] = useState(null)

    // INPUT CHANGE HANDLERS

    const handleTableNameChange = (event) => setTableName(event.target.value);
    const handleCapacityChange = (event) => setCapacity(Number(event.target.value))

    // BUTTON HANDLERS

    function cancelHandler() {
        history.goBack()
    }

    // Creates table when submitted
    const submitHandler = async(event) => {
        event.preventDefault();

        const abortController = new AbortController();

        try {
        await createTable({table_name, capacity}, abortController.signal)
        history.push(`/dashboard`)
        } catch (error) {
            setError(error)
        }

        return () => abortController.abort()
    }

    return (
        <div>
            <h1>New Table</h1>
            <form onSubmit={submitHandler}>
                <div>
                    <label htmlFor="table_name">
                        Table Name:
                        <input required type="text" id="table_name" name="table_name" onChange={handleTableNameChange} />
                    </label>
                </div>
                <div>
                    <label htmlFor="capacity">
                        Capacity:
                        <input required type="number" id="capacity" name="capacity" min="1" onChange={handleCapacityChange}/>
                    </label>
                </div>
                <div>
                    <button type="submit">Submit</button>
                    <button type="cancel" onClick={cancelHandler}>Cancel</button>
                </div>
            </form>
            <ErrorAlert error={error} />
        </div>
    )
}

export default CreateTable;