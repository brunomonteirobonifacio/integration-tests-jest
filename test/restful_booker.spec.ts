import pactum, { expect } from 'pactum';
import { StatusCodes } from 'http-status-codes';
import { SimpleReporter } from '../simple-reporter';

describe('Restful Booker', () => {
    const p = pactum;
    const rep = SimpleReporter;
    const baseUrl = 'https://restful-booker.herokuapp.com';

    p.request.setDefaultTimeout(30000);
    
    let authToken;

    beforeAll(async () => {
        authToken = await p.spec()
            .post(`${baseUrl}/auth`)
            .withHeaders({
                'Content-Type': 'application/json'
            })
            .withBody({
                username: 'admin',
                password: 'password123'
            })
            .expectStatus(StatusCodes.OK)
            .expectBodyContains('token')
            .returns('token');
    });

    describe('GetBookingIds', () => {
        it('Deveria retornar os IDs de todas as reservas', async () => {
            await p.spec()
                .get(`${baseUrl}/booking`)
                .expectStatus(StatusCodes.OK)
                .expectJsonSchema({ type: 'array' });
        });
    });

    describe('CreateBooking', () => {
        it('Deveria criar uma nova reserva', async () => {
            await p.spec()
                .post(`${baseUrl}/booking`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withBody({
                    firstname: 'John',
                    lastname: 'Doe',
                    totalprice: 120,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2026-10-10',
                        checkout: '2026-10-12'
                    },
                    additionalneeds: 'Breakfast'
                })
                .expectStatus(StatusCodes.OK)
                .expectJsonLike({
                    booking: {
                        firstname: 'John',
                        lastname: 'Doe',
                        totalprice: 120,
                        depositpaid: true,
                        bookingdates: {
                            checkin: '2026-10-10',
                            checkout: '2026-10-12'
                        },
                        additionalneeds: 'Breakfast'
                    }
                })
                .expectJsonSchema('bookingid', { type: 'number' });
        });
    });

    describe('UpdateBooking', () => {
        it('Deveria editar a reserva', async () => {
            const bookingId = await p.spec()
                .post(`${baseUrl}/booking`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withCookies(`token=${authToken}`)
                .withBody({
                    firstname: 'John',
                    lastname: 'Doe',
                    totalprice: 120,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2026-10-13',
                        checkout: '2026-10-15'
                    },
                    additionalneeds: 'Breakfast'
                })
                .expectStatus(StatusCodes.OK)
                .returns('bookingid');

            await p.spec()
                .put(`${baseUrl}/booking/${bookingId}`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withCookies(`token=${authToken}`)
                .withBody({
                    firstname: 'John',
                    lastname: 'Updated',
                    totalprice: 120,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2026-10-10',
                        checkout: '2026-10-12'
                    },
                    additionalneeds: 'Breakfast'  
                })
                .expectStatus(StatusCodes.OK)
                .expectJsonLike({
                    lastname: 'Updated',
                    bookingdates: {
                        checkin: '2026-10-10',
                        checkout: '2026-10-12'
                    }
                });
        });
    });

    describe('PartialUpdateBooking', () => {
        it('Deveria editar a reserva', async () => {
            const bookingId = await p.spec()
                .post(`${baseUrl}/booking`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withCookies(`token=${authToken}`)
                .withBody({
                    firstname: 'John',
                    lastname: 'Doe',
                    totalprice: 120,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2026-10-13',
                        checkout: '2026-10-15'
                    },
                    additionalneeds: 'Breakfast'
                })
                .expectStatus(StatusCodes.OK)
                .returns('bookingid');

            await p.spec()
                .patch(`${baseUrl}/booking/${bookingId}`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withCookies(`token=${authToken}`)
                .withBody({
                    lastname: 'Updated',
                    bookingdates: {
                        checkin: '2026-10-10',
                        checkout: '2026-10-12'
                    },
                    additionalneeds: 'Breakfast'  
                })
                .expectStatus(StatusCodes.OK)
                .expectJsonLike({
                    lastname: 'Updated',
                    bookingdates: {
                        checkin: '2026-10-10',
                        checkout: '2026-10-12'
                    }
                });
        });
        
        it('Não deveria alterar as informações da reserva que não foram enviadas por parâmetro', async () => {
            const bookingId = await p.spec()
                .post(`${baseUrl}/booking`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withCookies(`token=${authToken}`)
                .withBody({
                    firstname: 'John',
                    lastname: 'Doe',
                    totalprice: 120,
                    depositpaid: true,
                    bookingdates: {
                        checkin: '2026-10-13',
                        checkout: '2026-10-15'
                    },
                    additionalneeds: 'Breakfast'
                })
                .expectStatus(StatusCodes.OK)
                .returns('bookingid');

            await p.spec()
                .patch(`${baseUrl}/booking/${bookingId}`)
                .withHeaders({
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                })
                .withCookies(`token=${authToken}`)
                .withBody({
                    lastname: 'Updated',
                    bookingdates: {
                        checkin: '2026-10-10',
                        checkout: '2026-10-12'
                    },
                })
                .expectStatus(StatusCodes.OK)
                .expectJsonLike({
                    firstname: 'John',
                    totalprice: 120,
                    depositpaid: true,
                    additionalneeds: 'Breakfast'
                });
        });
    });
});