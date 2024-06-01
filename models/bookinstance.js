const moongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = moongoose.Schema;

const BookInstanceSchema = new Schema({
  book: { type: Schema.Types.ObjectId, ref: "Book", required: true }, // Referance associated to the book
  imprint: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: ["Available", "Maintenance", "Loaned", "Reserved"],
    default: "Maintenance",
  },
  due_back: { type: Date, default: Date.now },
});

BookInstanceSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/bookinstance/${this._id}`;
});
BookInstanceSchema.virtual("due_back_yyy_mm_dd").get(function () {
  return DateTime.fromJSDate(this.due_back).toUTC().toISODate();
  // format 'YYYY-MM-DD'
});
BookInstanceSchema.virtual("due_date_formatted").get(function () {
  return DateTime.fromJSDate(this.due_back).toLocaleString(DateTime.DATE_FULL);
});
module.exports = moongoose.model("BookInstance", BookInstanceSchema);
