import { useState } from 'react'
import { Form, Button, Container } from "react-bootstrap"
import 'bootstrap/dist/css/bootstrap.min.css';

const Home = () => {
  const [bookedTeeTimes, setBookedTeeTimes] = useState([]);
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [players, setPlayers] = useState('');
  const [holes, setHoles] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    //    // Combine date and time strings and parse desired tee time
    const dateTimeString = `${date} ${time}`;
    const parsedTime = new Date(dateTimeString);
    
    // Calculate the estimated finish time
    let estimatedFinishTime;
    if (holes === 9) {
      estimatedFinishTime = new Date(parsedTime.getTime() + 2.5 * 60 * 60 * 1000);
    } else if (holes === 18) {
      estimatedFinishTime = new Date(parsedTime.getTime() + 4.5 * 60 * 60 * 1000);
    }
    
    // Filter booked tee times that overlap with the desired tee time
    const overlappingTeeTimes = bookedTeeTimes.filter((teeTime) => {
      const teeTimeStart = new Date(teeTime.time);
      const teeTimeFinish = new Date(teeTimeStart.getTime() + (teeTime.holes === 9 ? 2.5 : 4.5) * 60 * 60 * 1000);
      return parsedTime < teeTimeFinish && teeTimeStart < estimatedFinishTime;
    });
    
    // Check if there are already 4 players during the overlapping tee times
    let playersBooked = players;
    overlappingTeeTimes.forEach((teeTime) => {
      playersBooked += teeTime.players;
    });

    if (playersBooked >= 4) {
      alert('Sorry, there are already 4 users playing during this time or there will be after the start of your desired tee time. The earliest available tee time is ' + estimatedFinishTime.toLocaleString() + '.');
    } else {
      alert('The tee time at ' + parsedTime.toLocaleString() + ' is available!');
      console.log({ name, time: parsedTime, players, holes })
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/teeTimes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, time: parsedTime, players, holes }),
      });

      if (response.ok) {
        setName('')
        setDate('')
        setTime('')
        setPlayers('')
        setHoles('')
      }
    }
  };

  const fetchTeeTimes = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/teeTimes`);
    const data = await response.json();
    console.log(data)
    setBookedTeeTimes(data);
  };

  //TODO: prevent from fetching twice
  useState(() => {
    fetchTeeTimes();
  }, []);

  return (
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
          <Form.Control
            type="time"
            placeholder="Enter desired tee time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
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
  );
};

export default Home;