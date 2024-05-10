import { Injectable } from '@nestjs/common';
import { SendDataDto } from './dto/sendDataDto';
import * as process from 'process';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoClient = require('mongodb').MongoClient;

const client = new MongoClient(process.env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

@Injectable()
export class DataService {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async create(sendDataDto: SendDataDto) {
    async function addMeasurementToDevice(
      deviceId: string,
      timestamp: number,
      current: number,
    ) {
      try {
        await client.connect();

        const db = client.db('Onlab');

        const date = new Date(timestamp * 1000); // Convert UNIX timestamp to milliseconds

        const device = await db
          .collection('Plug')
          .findOne({ deviceId: deviceId });

        const currentTimezone =
          Intl.DateTimeFormat().resolvedOptions().timeZone;
        const hungaryTimezone = 'Europe/Budapest';
        const hungaryOffset = 2;

        if (device) {
          // Extract data from deviceData
          let year = null;
          let month = null;
          let day = null;
          let hour = null;
          let minute = null;
          let second = null;

          if (currentTimezone === hungaryTimezone) {
            year = date.getFullYear();
            month = date.getMonth() + 1; // Note: getMonth() returns month index starting from 0
            day = date.getDate();
            hour = date.getHours();
            minute = date.getMinutes();
            second = date.getSeconds();
          } else {
            year = date.getUTCFullYear();
            month = date.getUTCMonth() + 1; // Note: getMonth() returns month index starting from 0
            day = date.getUTCDay();
            hour = date.getUTCHours() + hungaryOffset;
            minute = date.getUTCMinutes();
            second = date.getUTCSeconds();
          }

          // Check if the year exists
          const yearExists = device.years.some((y) => y.year === year);

          if (!yearExists) {
            // Add the year if it doesn't exist
            await db
              .collection('Plug')
              .updateOne(
                { deviceId: deviceId },
                { $addToSet: { years: { year: year, months: [] } } },
              );
          }

          // Check if the month exists
          const monthExists = device.years
            .find((y) => y.year === year)
            ?.months.some((m) => m.month === month);

          if (!monthExists) {
            // Add the month if it doesn't exist
            await db
              .collection('Plug')
              .updateOne(
                { deviceId: deviceId, 'years.year': year },
                { $addToSet: { 'years.$.months': { month: month, days: [] } } },
              );
          }

          // Check if the day exists
          const dayExists = device.years
            .find((y) => y.year === year)
            ?.months.find((m) => m.month === month)
            ?.days.some((d) => d.day === day);

          if (!dayExists) {
            // Add the day if it doesn't exist
            await db.collection('Plug').updateOne(
              {
                deviceId: deviceId,
                'years.year': year,
                'years.months.month': month,
              },
              {
                $addToSet: {
                  'years.$.months.$[monthFilter].days': {
                    day: day,
                    hours: [],
                  },
                },
              },
              { arrayFilters: [{ 'monthFilter.month': month }] },
            );
          }

          // Check if the hour exists
          const hourExists = device.years
            .find((y) => y.year === year)
            ?.months.find((m) => m.month === month)
            ?.days.find((d) => d.day === day)
            ?.hours.some((h) => h.hour === hour);

          if (!hourExists) {
            // Add the hour if it doesn't exist
            await db.collection('Plug').updateOne(
              {
                deviceId: deviceId,
                'years.year': year,
                'years.months.month': month,
                'years.months.days.day': day,
              },
              {
                $addToSet: {
                  'years.$.months.$[monthFilter].days.$[dayFilter].hours': {
                    hour: hour,
                    minutes: [],
                  },
                },
              },
              {
                arrayFilters: [
                  { 'monthFilter.month': month },
                  { 'dayFilter.day': day },
                ],
              },
            );
          }

          // Check if the minute exists
          const minuteExists = device.years
            .find((y) => y.year === year)
            ?.months.find((m) => m.month === month)
            ?.days.find((d) => d.day === day)
            ?.hours.find((h) => h.hour === hour)
            ?.minutes.some((m) => m.minute === minute);

          if (!minuteExists) {
            // Add the minute if it doesn't exist
            await db.collection('Plug').updateOne(
              {
                deviceId: deviceId,
                'years.year': year,
                'years.months.month': month,
                'years.months.days.day': day,
                'years.months.days.hours.hour': hour,
              },
              {
                $addToSet: {
                  'years.$.months.$[monthFilter].days.$[dayFilter].hours.$[hourFilter].minutes':
                    { minute: minute, measures: [] },
                },
              },
              {
                arrayFilters: [
                  { 'monthFilter.month': month },
                  { 'dayFilter.day': day },
                  { 'hourFilter.hour': hour },
                ],
              },
            );
          }

          // Add measurements
          await db.collection('Plug').updateOne(
            {
              deviceId: deviceId,
              'years.year': year,
              'years.months.month': month,
              'years.months.days.day': day,
              'years.months.days.hours.hour': hour,
              'years.months.days.hours.minutes.minute': minute,
            },
            {
              $addToSet: {
                'years.$[yearFilter].months.$[monthFilter].days.$[dayFilter].hours.$[hourFilter].minutes.$[minuteFilter].measures':
                  {
                    second: second,
                    current: current,
                  },
              },
            },
            {
              arrayFilters: [
                { 'yearFilter.year': year },
                { 'monthFilter.month': month },
                { 'dayFilter.day': day },
                { 'hourFilter.hour': hour },
                { 'minuteFilter.minute': minute },
              ],
            },
          );

          console.log('Data added successfully');
        } else {
          console.log('Device not found');
        }
      } catch (error) {
        console.error('Error occurred:', error);
      } finally {
        //await client.close();
      }
    }

    await addMeasurementToDevice(
      sendDataDto.deviceId,
      sendDataDto.timestamp,
      sendDataDto.current,
    );
  }

  async getData(id: string) {
    try {
      await client.connect();

      const db = client.db('Onlab');

      const data = db.collection('Plug').aggregate([
        // Match documents for a specific plug
        {
          $match: {
            deviceId: id, // Replace this with the desired deviceId
          },
        },
        // Unwind years array
        { $unwind: '$years' },
        // Unwind months array
        { $unwind: '$years.months' },
        // Unwind days array
        { $unwind: '$years.months.days' },
        // Unwind hours array
        { $unwind: '$years.months.days.hours' },
        // Unwind minutes array
        { $unwind: '$years.months.days.hours.minutes' },
        // Project fields
        {
          $project: {
            _id: 0,
            year: '$years.year',
            month: '$years.months.month',
            day: '$years.months.days.day',
            hour: '$years.months.days.hours.hour',
            minute: '$years.months.days.hours.minutes.minute',
            measures: '$years.months.days.hours.minutes.measures',
          },
        },
      ]);

      let document: {
        year: any;
        month: any;
        day: any;
        hour: any;
        minute: any;
        measures: any;
      };
      const dataToBeSent = [];
      while ((document = await data.next())) {
        const { year, month, day, hour, minute, measures } = document;
        measures.forEach((measure, index) => {
          const timestamp = Math.floor(
            new Date(
              year,
              month - 1,
              day,
              hour,
              minute,
              measures[index].second,
            ).getTime(),
          );
          const value = measures[index].current;

          dataToBeSent.push({
            timestamp: timestamp,
            value: value,
          });
        });
      }
      console.log(dataToBeSent);
      return this.mapConsecutiveData(dataToBeSent);
    } catch (error) {
      console.error('Error occurred:', error);
    }
  }

  mapConsecutiveData(sensorData) {
    const mappedData = [];
    let consecutiveData = [];

    for (let i = 0; i < sensorData.length; i++) {
      if (sensorData[i].value > 0) {
        consecutiveData.push(sensorData[i]);
      } else {
        if (consecutiveData.length > 0) {
          mappedData.push({
            startTime: consecutiveData[0].timestamp,
            endTime: consecutiveData[consecutiveData.length - 1].timestamp,
          });
          consecutiveData = [];
        }
      }
    }

    if (consecutiveData.length > 0) {
      mappedData.push({
        startTime: consecutiveData[0].timestamp,
        endTime: consecutiveData[consecutiveData.length - 1].timestamp,
      });
    }

    return mappedData;
  }
}
