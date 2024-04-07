import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import * as process from 'process';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const MongoClient = require('mongodb').MongoClient;

@Injectable()
export class PlugService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    return this.prisma.plug.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.plug.findMany();
  }

  async create(createPlugDto: Prisma.PlugCreateInput) {
    return this.prisma.plug.create({ data: createPlugDto });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async updateData(id: string, updatePlugDto: Prisma.PlugUpdateInput) {
    //return this.prisma.plug.update({ where: { id }, data: updatePlugDto });

    const client = new MongoClient(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    async function addMeasurementToDevice(
      deviceId,
      timestamp,
      voltage,
      current,
    ) {
      try {
        await client.connect();

        const db = client.db('Onlab');

        const date = new Date(timestamp * 1000); // Convert UNIX timestamp to milliseconds

        const device = await db
          .collection('Plug')
          .findOne({ deviceId: deviceId });

        if (device) {
          // Extract data from deviceData
          const year = date.getFullYear();
          const month = date.getMonth() + 1; // Note: getMonth() returns month index starting from 0
          const day = date.getDate();
          const hour = date.getHours();
          const minute = date.getMinutes();
          const second = date.getSeconds();

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
                    voltage: voltage,
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

    // Usage
    for (let i = 1; i < 15; i++) {
      console.log(i);
      await addMeasurementToDevice(id, 1710613852 + i, 230, 71);
    }
  }

  async update(id: string, updatePlugDto: Prisma.PlugUpdateInput) {
    return this.prisma.plug.update({ where: { id }, data: updatePlugDto });
  }

  async remove(id: string) {
    return this.prisma.plug.delete({ where: { id } });
  }
}
