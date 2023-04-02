import { connectDB } from '../../../db';
import TeeTime from '../../../models/TeeTime';
import { handler } from './teeTimes.js';
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
    beforeAll(async () => {
        console.log('before all handler')
        // Connect to the test database
        await connectDB('test');
        console.log('Connected to database');
    });

    beforeEach(async () => {
        console.log('before each handler')
        await TeeTime.deleteMany({});
        console.log('after delete')
    });

    afterAll(async () => {
        console.log('disconnecting')
        // Disconnect from the test database after all tests have run
        await mongoose.disconnect();
        console.log('after disconnect')
    });

    describe('POST method', () => {
        console.log('describe')
        beforeEach(() => {
            req.method = 'POST';
        });

        afterEach(async () => {
            await TeeTime.deleteMany({});
            console.log('after delete POST')
        });

        test('should return success if there are no overlapping tee times', async () => {
            console.log('overlap start')
            // Arrange
            req.body = {
                name: 'John Doe',
                date: '2022-01-01',
                time: '10:00',
                players: 4,
                holes: 18,
            };

            // Act
            await handler(req, res);
            console.log('after handler')

            // Assert
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                success: true,
                message: 'The tee time at 2022-01-01 10:00:00 AM is available!',
            });

            // Check that the tee time was saved to the database
            const savedTeeTimes = await TeeTime.find();
            expect(savedTeeTimes).toHaveLength(1);
            expect(savedTeeTimes[0].name).toEqual('John Doe');
            expect(savedTeeTimes[0].time).toEqual(new Date('2022-01-01T10:00:00'));
            expect(savedTeeTimes[0].players).toEqual(4);
            expect(savedTeeTimes[0].holes).toEqual(18);
        });

        test('should return failure if there are already 4 players during the overlapping tee times', async () => {
            // Arrange
            req.body = {
                name: 'Jane Smith',
                date: '2022-01-01',
                time: '10:00',
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
                message: 'Sorry, there are already 4 users playing during this time, or there will be after the start of your desired tee time. The earliest available tee time is 12/31/2021, 11:30:00 PM.',
            });

            // Check that the tee time was not saved to the database
            const savedTeeTimes = await TeeTime.find();
            expect(savedTeeTimes).toHaveLength(1);
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
                time: new Date('2022-01-01T10:00:00'),
                players: 4,
                holes: 18,
            });

            const teeTime2 = new TeeTime({
                name: 'Jane Smith',
                time: new Date('2022-01-01T14:00:00'),
                players: 3,
                holes: 9,
            });

            await teeTime1.save();
            await teeTime2.save();

            // Act
            const res = await request(app).get('/api/tee-times');

            // Assert
            expect(res.status).toBe(200);
            expect(res.body).toHaveLength(2);
            expect(res.body[0]._id).toEqual(teeTime1._id.toString());
            expect(res.body[0].name).toEqual(teeTime1.name);
            expect(res.body[0].time).toEqual(teeTime1.time.toISOString());
            expect(res.body[0].players).toEqual(teeTime1.players);
            expect(res.body[0].holes).toEqual(teeTime1.holes);
            expect(res.body[1]._id).toEqual(teeTime2._id.toString());
            expect(res.body[1].name).toEqual(teeTime2.name);
            expect(res.body[1].time).toEqual(teeTime2.time.toISOString());
            expect(res.body[1].players).toEqual(teeTime2.players);
            expect(res.body[1].holes).toEqual(teeTime2.holes);

            // Clean up
            await TeeTime.deleteMany({});
        });

        test('should return method not allowed', async () => {
            // Act
            const res = await request(app).put('/api/tee-times');

            // Assert
            expect(res.status).toBe(405);
            expect(res.body.message).toEqual('Method not allowed');
        });
    });
});

// Clean up
afterAll(async () => {
    await mongoose.disconnect();
});