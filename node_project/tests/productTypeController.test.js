const controller = require('../controllers/productTypeController')
const {ProductType} = require("../models")
const sequelize = require("../db")
//const app = require('../index')
const request = require('supertest')


const req = request("http://localhost:3000");

beforeAll(async () => {
    await sequelize.sync({ force: true });
});
   
describe("group1", () => {
    // test('create', () => {

    //     // const Req = { body: { name: 'Test_type' } };
    //     // const Res = {};
    
    //     // await controller.create(Req, Res)
    //     expect(1).toBe(1);
    // });
    
    it('create_type', async () => {
        let name = "testName"

        const productType = await ProductType.create({name});
        const { count, rows } = await ProductType.findAndCountAll();
        expect(count).toEqual(1)
    }),

    it('test2', async () => {
        
        expect(47).toEqual(47)
    }),

    it('test3', async () => {
        let a = 4 * 8
        expect(32).toEqual(a)
    })

    
})




