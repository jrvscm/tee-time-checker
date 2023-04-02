import React, { useState } from 'react'
import { Form, Button, Container, Alert } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  const [bookedTeeTimes, setBookedTeeTimes] = useState();
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('7:00 AM');
  const [players, setPlayers] = useState('');
  const [holes, setHoles] = useState('');
  const [successMessage, setSuccessMessage] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  const handleSubmit = async e => {
    e.preventDefault();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/teeTimes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, date, time, players, holes }),
    })

    if (response.ok) {
      setName('')
      setDate('')
      setTime('')
      setPlayers('')
      setHoles('')
    }

    const data = await response.json()
    const { success, message } = data;
    if(success && message) {
      setSuccessMessage(message)
      setFailureMessage(null)
    } else if(message) {
      setFailureMessage(message)
      setSuccessMessage(null)
    } else {
      //throw a error the db fooked up
    }
  };

  const fetchTeeTimes = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/teeTimes`);
    const data = await response.json();
    setBookedTeeTimes(data);
  };


  // Set the start and end times as Date objects
  const start_time = new Date('January 1, 2000 07:00:00');
  const end_time = new Date('January 1, 2000 19:00:00');

  // Set the time increment as the number of milliseconds in 5 minutes
  const increment = 5 * 60 * 1000;

  // Initialize an empty array to store the select options
  const select_options = [];

  // Loop from start_time to end_time by the increment
  for (let time = start_time; time <= end_time; time.setTime(time.getTime() + increment)) {
    // Format the time as a string in the format HH:MM AM/PM
    const time_str = time.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    // Create an <option> element with the time string as both the value and label
    const option = <option key={time_str} value={time_str}>{time_str}</option>;
    // Append the <option> element to the select_options array
    select_options.push(option);
  }


  //TODO: prevent from fetching twice
  useState(() => {
    fetchTeeTimes()
  }, []);

  return (
    <>
    {successMessage && (
      <Alert variant={'success'}>
        { successMessage }
      </Alert>
    )}
    {failureMessage && (
      <Alert variant={'danger'}>
        { failureMessage }
      </Alert>
    )}

      <Container fluid="md">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value.trim())}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="date">
            <Form.Label>Date</Form.Label>
            <Form.Control
              type="date"
              placeholder="Enter desired date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="time">
            <Form.Label>Time</Form.Label>
            <Form.Select
              placeholder="Enter desired tee time"
              value={time}
              onChange={(e) => setTime(e.target.value)}>
              {select_options}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="players">
            <Form.Label>Players</Form.Label>
            <Form.Control
              as="select"
              value={players}
              onChange={(e) => setPlayers(parseInt(e.target.value, 10))}
            >
              <option>Select number of players</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-3" controlId="holes">
            <Form.Label>Holes</Form.Label>
            <Form.Control
              as="select"
              value={holes}
              onChange={(e) => setHoles(parseInt(e.target.value, 10))}
            >
              <option>Select number of holes</option>
              <option value="9">9</option>
              <option value="18">18</option>
            </Form.Control>
          </Form.Group>

          <Button variant="primary" type="submit">
            Check Availability
          </Button>
        </Form>
      </Container>
    </>
  );
};

export default Home;