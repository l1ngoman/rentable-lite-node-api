// const User = require('../../api/models/user');
// // jest.mock('../../api/models/user');

// describe("User.getAllUsers", () => {
//     const newUser = new User();
//     it("should return an object", () => {
//         expect(newUser.getAllUsers()).toBeCalledWith(
//             expect.objectContaining({
//                 message:        expect.any(String),
//                 responseObject: expect.any(Array),
//             })
//         );
//     });
// });

const request = require('supertest')
const { getAllUsers } = require('../../api/models/user')
describe('GET Users', () => {
  it('should get all users', async () => {
    const res = await request(getAllUsers)
    .get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message');
  })
})