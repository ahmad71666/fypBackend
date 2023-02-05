const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MedicineSchema = new Schema({
    name: {
        type: String,
        required: true
    }
}, { timestamps: true });


const Medicines = mongoose.model('Medicines', MedicineSchema)

module.exports = Medicines;