/*
*
*
*       Complete the API routing below
*
*
*/

"use strict"

const expect = require("chai").expect
const mongoose = require("mongoose")
const MongoClient = require("mongodb")
const ObjectId = require("mongodb").ObjectId
const fetch = require("node-fetch")

const Like = require("../models")

module.exports = app => {

  app.route("/api/stock-prices")
    .get(async (req, res) => {
      let stock = req.query.stock
      let like = req.query.like

      if (!stock)
        return res.json("error: No stock provided")
      else {
        // convert a single stock to an array
        if (!Array.isArray(stock))
          stock = [stock]
        // convert a single like to an array
        if (!Array.isArray(like))
          like = [like]        
        
        // Build new stock array with the current price
        let stocks = await Promise.all(stock.map(async (x, i) => {
          let tempStock = {}
          tempStock.stock = x.toUpperCase()
          // accept string for testing - boolean for forms
          tempStock.like = like[i]
          if (tempStock.like === "true" || tempStock.like === true)
            tempStock.ip = req.ip

          await fetch(`https://repeated-alpaca.glitch.me/v1/stock/${tempStock.stock}/quote`)          
            .then(response => response.json())
            .then(data => {
              tempStock.price = data.latestPrice
              tempStock.companyName = data.companyName
              tempStock.changePercent = data.changePercent
            })
            .catch(err => console.log(err))

          return tempStock
        }))

        // eliminate stock tickers that dont resolve to a real stock and return a price
        stocks = stocks.filter(x => x.price)
        
        // array was full of bad stocks
        if (stocks.length === 0)
          return res.json("error: Enter a valid stock")
        
        // save stocks with like to the DB
        stocks = await Promise.all(stocks.map(async x => {
          await Like.findOne({stock: x.stock})                      
            .then(data => {
              if (data === null) {
                // Add a new stock entry to DB if like is true
                if (x.like === "true" || x.like === true) {
                  const newLike = new Like({stock: x.stock, likes: 1, ips: x.ip})                                    
                  newLike.save().catch(err => console.log(err))
                  x.likes = 1
                }
                // stock not found in DB and no like
                else 
                  x.likes = 0
              }
              else {
                // stock exists in DB                
                // like is true and if ip not found in Like, add it and increase likes
                if (x.like === "true" || x.like === true) {                
                  if (!data.ips.includes(x.ip)) {
                    Like.updateOne({_id: ObjectId(data._id)}, {$set: {likes: data.likes + 1, ips: [x.ip , ...data.ips]}})
                      .then(x.likes = data.likes + 1)
                      .catch(err => console.log(err))
                  }
                  // ip exists so save current likes
                  else
                    x.likes = data.likes                                                    
                }
                // like is false, get saved likes
                else
                  x.likes = data.likes                                                                    

              }
            })
            .catch(err => console.log(err))
          return x
        }))
        
        res.json({stockData: stocks.map((x, i) => {
          // if 2 stocks add rel_likes to output
          if (stocks.length === 2) {
            (i === 0) ? x.rel_likes = stocks[0].likes - stocks[1].likes :
              x.rel_likes = stocks[1].likes - stocks[0].likes
          }
          return x
        })})        

        
/* 
 *  Code for FCC output requirement 
 *
        // determine output 1 or 2+ stocks                
        res.json({stockData: stocks.map((x, i) => {
          if (stocks.length === 2) {
            (i === 0) ? x.rel_likes = stocks[0].likes - stocks[1].likes :
              x.rel_likes = stocks[1].likes - stocks[0].likes
            return {stock: x.stock, price: x.price, rel_likes: x.rel_likes}                          
          }
          else 
            return x
        })})
*/
      }
    })
}
