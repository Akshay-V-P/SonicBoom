const couponModel = require('../model/couponModel')

async function applyCoupon(checkoutDetails, couponCode, userId, res) {
    let today = new Date()
       let couponDiscountAmout 

        const coupon = await couponModel.findOne({ code: couponCode })
        if (!coupon) {
          
          throw {
            status: 404,
            message : "Please enter a valid code"
          }
    
        }
              
              const isUsed = coupon.usedBy.includes(userId)
        if (isUsed) {
          
          throw {
            status: 401,
            message:"Coupon already used"
          }

        }
              
              let expiryDate = new Date(coupon.expiryDate)
        if (expiryDate < today) {
          
          throw {
            status: 401,
            message:"Coupon expired"
          }

        }
              
        if (checkoutDetails.total < coupon.minPurchase) {
          
          throw {
            status: 401,
            message:`Add more items of value ₹${coupon.minPurchase - checkoutDetails.total} to apply this coupon`
          }

        }
        
        if (coupon.discountType === "percentage") {
          
          couponDiscountAmout = (parseInt(checkoutDetails.total) / 100) * parseInt(coupon.discount)
          if (couponDiscountAmout > coupon.maxDiscount) {

            couponDiscountAmout = coupon.maxDiscount

          }

        } else {

          couponDiscountAmout = parseInt(coupon.discount)

        }
  
        let totalBeforeCoupon = checkoutDetails.total
        checkoutDetails.total = parseInt(checkoutDetails.total) - couponDiscountAmout
        if (checkoutDetails.total < 0) {
          
          couponDiscountAmout = totalBeforeCoupon
          checkoutDetails.total = 0

        }
  
        checkoutDetails.couponDiscount = couponDiscountAmout
  checkoutDetails.couponDetails = coupon

  let usedBy = {
    userId,
  }

  await couponModel.updateOne({ code: couponCode }, { $set: {usedBy} })
  return checkoutDetails
}

async function removeCoupon(checkoutDetails, couponCode, userId) {

    let couponDiscountAmout

        // const coupon = await couponModel.findOne({ code: couponCode })
        
        // if (coupon.discountType === "percentage") {
        //   couponDiscountAmout = (parseInt(checkoutDetails.total) / 100) * parseInt(coupon.discount)
        //   if (couponDiscountAmout > coupon.maxDiscount) {
        //     couponDiscountAmout = coupon.maxDiscount
        //   }
        // } else {
        //   couponDiscountAmout = parseInt(coupon.discount)
        // }
        // let totalBeforeCoupon = checkoutDetails.total
        // checkoutDetails.total = parseInt(checkoutDetails.total) + couponDiscountAmout
        // if (checkoutDetails.total < 0) {
        //   couponDiscountAmout = totalBeforeCoupon
        //   checkoutDetails.total = 0
        // }
        // checkoutDetails.couponDiscount = couponDiscountAmout
  // checkoutDetails.couponDetails = coupon
  await couponModel.updateOne({ code: couponCode }, { $pull: { usedBy: { userId } } })
  checkoutDetails.couponDiscount = 0
  return checkoutDetails
  
}

module.exports = {
  applyCoupon,
  removeCoupon
}