const mongoose = require("mongoose");
const { DateTime } = require("luxon");
const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  first_name: { type: String, required: true, maxLenght: 100 },
  family_name: { type: String, required: true, maxLenght: 100 },
  date_of_birth: { type: Date },
  date_of_death: { type: Date },
});

// Virtual for author's full name
AuthorSchema.virtual("name").get(function () {
  // To avoid errors in cases where an author does not have either a family name or first name
  // We want to make sure we handle the exception by returning an empty string for that case
  let fullname = "";
  if (this.first_name && this.family_name) {
    fullname = `${this.family_name}, ${this.first_name}`;
  }
  return fullname;
});

// Virtual for author's URL
AuthorSchema.virtual("url").get(function () {
  // We don't use an arrow function as we'll need the this object
  return `/catalog/author/${this._id}`;
});
AuthorSchema.virtual("date_of_birth_formatted").get(function () {
  return DateTime.fromJSDate(this.date_of_birth)
    .toUTC()
    .toLocaleString(DateTime.DATE_FULL);
});
AuthorSchema.virtual("date_of_death_formatted").get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death)
        .toUTC()
        .toLocaleString(DateTime.DATE_FULL)
    : "";
});

AuthorSchema.virtual("date_of_birth_calender").get(function () {
  return this.date_of_birth
    ? DateTime.fromJSDate(this.date_of_birth).toUTC().toFormat("yyyy-MM-dd")
    : "";
});
AuthorSchema.virtual("date_of_death_calender").get(function () {
  return this.date_of_death
    ? DateTime.fromJSDate(this.date_of_death).toUTC().toFormat("yyyy-MM-dd")
    : "";
});

module.exports = mongoose.model("Author", AuthorSchema);
