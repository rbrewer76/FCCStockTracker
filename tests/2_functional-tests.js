/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require("chai-http")
const chai = require("chai")
const assert = chai.assert
const server = require("../server")

chai.use(chaiHttp)

suite("Functional Tests", () => {
    
    suite("GET /api/stock-prices => stockData object", () => {
      
      test("1 stock", done => {
       chai.request(server)
        .get("/api/stock-prices")
        .query({stock: "goog", like: false})
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.property(res.body, "stockData")
          assert.property(res.body.stockData[0], "stock")
          assert.property(res.body.stockData[0], "price")
          assert.property(res.body.stockData[0], "likes")
          done()
        })   
      })
      
      test("1 stock with like", done => {
       chai.request(server)
        .get("/api/stock-prices")
        .query({stock: "goog", like: true})
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.property(res.body, "stockData")
          assert.property(res.body.stockData[0], "stock")
          assert.property(res.body.stockData[0], "price")
          assert.property(res.body.stockData[0], "likes")
          assert.equal(res.body.stockData[0].likes, 1)          
          done()
        })        
      })
      
      test("1 stock with like again (ensure likes arent double counted)", done => {
       chai.request(server)        
        .get("/api/stock-prices")
        .query({stock: "goog", like: true})
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.property(res.body, "stockData")
          assert.property(res.body.stockData[0], "stock")
          assert.property(res.body.stockData[0], "price")
          assert.property(res.body.stockData[0], "likes")
          assert.equal(res.body.stockData[0].likes, 1) 
          done()        
        }) 
      })
      
      test("2 stocks", done => {
       chai.request(server)        
        .get("/api/stock-prices")
        .query({stock: ["goog", "amzn"], like: [false, false]})
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.property(res.body, "stockData")
          assert.property(res.body.stockData[0], "stock")
          assert.property(res.body.stockData[0], "price")
          assert.property(res.body.stockData[0], "rel_likes")
          assert.property(res.body.stockData[1], "stock")
          assert.property(res.body.stockData[1], "price")
          assert.property(res.body.stockData[1], "rel_likes")         
          done()        
        })          
      })
      
      test("2 stocks with like", done => {
       chai.request(server)        
        .get("/api/stock-prices")
        .query({stock: ["goog", "amzn"], like: [true, true]})
        .end((err, res) => {
          assert.equal(res.status, 200)
          assert.property(res.body, "stockData")
          assert.property(res.body.stockData[0], "stock")
          assert.property(res.body.stockData[0], "price")
          assert.property(res.body.stockData[0], "rel_likes")
          assert.property(res.body.stockData[1], "stock")
          assert.property(res.body.stockData[1], "price")
          assert.property(res.body.stockData[1], "rel_likes")         
          done()        
        })                 
      })
    })
})
