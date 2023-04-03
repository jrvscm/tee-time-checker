import connectDB from '../../../db';
import TeeTime from '../../../models/TeeTime';
import { handler } from './teeTimes';
import mongoose from 'mongoose';

// Mock the express request and response objects
const req = {
    method: '',
    body: {},
};

const res = {
    status: jest.fn(() => res),
    json: jest.fn(),
};

describe('handler', () => {
    // let app;
    // let server;
    // let db;
    const wrappedHandler = connectDB(handler);
    beforeAll(async () => {
        // // Connect to the test database
        // const { app: expressApp, server: httpServer, db: mongoDb }  = await connectDB(handler)(req, res);
        // app = expressApp;
        // server = httpServer;
        // db = mongoDb;

        await wrappedHandler(req, res);
    });

    beforeEach(async () => {
        await TeeTime.deleteMany();
    });

 
    afterAll(async () => {
        // Disconnect from the database and stop the server
        // await db.close();
        // server.close();
        await mongoose.disconnect();
    });


    describe('POST method', () => {
        beforeEach(() => {
            req.method = 'POST';
        });

        afterEach(async () => {
            await TeeTime.deleteMany({});
        });

        test('should return success if there are no overlapping tee times', async () => {
            // Arrange
            req.body = {
                name: 'John Doe',
                date: '2022-01-01',
                time: '10:00 AM',
                players: 4,
                holes: 18,
            };

            // Act
            await handler(req, res);

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'The tee time at 1/1/2022, 10:00:00 AM is available!', // updated date format
            });

            // Check that the tee time was saved to the database
            const savedTeeTimes = await TeeTime.find();
            expect(savedTeeTimes).toHaveLength(1);
            expect(savedTeeTimes[0].name).toEqual('John Doe');
            expect(savedTeeTimes[0].time.toString()).toEqual('Sat Jan 01 2022 10:00:00 GMT-0700 (Mountain Standard Time)');
            expect(savedTeeTimes[0].players).toEqual(4);
            expect(savedTeeTimes[0].holes).toEqual(18);
        });

        test('should return failure if there are already 4 players during the overlapping tee times', async () => {
            // Arrange
            req.body = {
                name: 'Jane Smith',
                date: '2022-01-01',
                time: '10:00 AM',
                players: 3,
                holes: 9,
            };

            // Add a booked tee time that overlaps with the desired tee time
            const bookedTeeTime = new TeeTime({
                name: 'John Doe',
                time: new Date('2022-01-01T09:00:00'),
                players: 4,
                holes: 18,
            });

            await bookedTeeTime.save();

            // Act
            await handler(req, res);
 
            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Sorry, there are already 4 users playing during this time, or there will be after the start of your desired tee time. The earliest available tee time is 1/1/2022, 12:30:00 PM.',
            });

            // Check that the tee time was not saved to the database
            const savedTeeTimes = await TeeTime.find();
            expect(savedTeeTimes).toHaveLength(1);
        });

        test('should return failure if there are already 4 players during the overlapping tee times', async () => {
            // Arrange
            // Desired tee time
            req.body = {
                name: 'Jane Smith',
                date: '2022-01-01',
                time: '10:00 AM',
                players: 3,
                holes: 9,
            };
          
            // Add a booked tee time that overlaps with the desired tee time
            const bookedTeeTime = new TeeTime({
                name: 'John Doe',
                time: new Date('2022-01-01T09:00:00'),
                players: 4,
                holes: 18,
            });

            await bookedTeeTime.save();
          
            // Add another booked tee time that overlaps with the desired tee time
            const bookedTeeTime2 = new TeeTime({
              name: 'Alice Lee',
              time: new Date('2022-01-01T09:30:00'),
              players: 2,
              holes: 9,
            });

            await bookedTeeTime2.save();
          
            // Act
            await handler(req, res);
          
            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: false,
                message: 'Sorry, there are already 4 users playing during this time, or there will be after the start of your desired tee time. The earliest available tee time is 1/1/2022, 12:30:00 PM.',
            });
          
            // Check that the tee time was not saved to the database
            const savedTeeTimes = await TeeTime.find();
            expect(savedTeeTimes).toHaveLength(2);
        });
    });

    describe('GET method', () => {
        beforeEach(() => {
            req.method = 'GET';
        });

        test('should return all tee times', async () => {
            // Arrange
            const teeTime1 = new TeeTime({
                name: 'John Doe',
                time: new Date('2023-01-01T10:00:00.000Z'),
                players: 4,
                holes: 18,
            });
          
            const teeTime2 = new TeeTime({
                name: 'Jane Smith',
                time: new Date('2022-01-01T22:00:00.000Z'),
                players: 3,
                holes: 9,
            });
            
            await teeTime1.save();
            await teeTime2.save();
          
            const req = {
              method: 'GET',
              url: '/api/teeTimes'
            };
          
            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn()
            };
          
            // Act
            await connectDB(handler)(req, res);
          
            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json.mock.calls[0][0]).toHaveLength(2);
            expect(res.json.mock.calls[0][0][0].name).toEqual(teeTime1.name);
            expect(res.json.mock.calls[0][0][0].time).toEqual(teeTime1.time.toString());
            expect(res.json.mock.calls[0][0][0].players).toEqual(teeTime1.players);
            expect(res.json.mock.calls[0][0][0].holes).toEqual(teeTime1.holes);
            expect(res.json.mock.calls[0][0][1].name).toEqual(teeTime2.name);
            expect(res.json.mock.calls[0][0][1].time).toEqual(teeTime2.time.toString());
            expect(res.json.mock.calls[0][0][1].players).toEqual(teeTime2.players);
            expect(res.json.mock.calls[0][0][1].holes).toEqual(teeTime2.holes);
          
            // Clean up
            await TeeTime.deleteMany({});
        });

        test('should return method not allowed', async () => {
            // Arrange
            const req = {
              method: 'PUT',
              url: '/api/teeTimes',
            };
            const res = {
              status: jest.fn().mockReturnThis(),
              json: jest.fn(),
            };
            
            // Act
            await handler(req, res);
          
            // Assert
            expect(res.status).toHaveBeenCalledWith(405);
            expect(res.json).toHaveBeenCalledWith({ message: 'Method not allowed' });
        });
    });
});

// Clean up
afterAll(async () => {
    await mongoose.disconnect();
});