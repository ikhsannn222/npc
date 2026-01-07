/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema
    .createTable("components", function (table) {
      table.increments("id").primary();
      table.string("name").notNullable();
      table.string("type").notNullable(); // CPU, GPU, RAM, etc.
      table.decimal("price", 15, 2).notNullable();
      table.string("image_url");
      table.text("specs"); // Detailed specifications
      table.text("description"); // Description
      table.string("marketplace_link"); // Link to purchase
      table.timestamps(true, true);
    })
    .createTable("monitors", function (table) {
      table.increments("id").primary();
      table.string("title").notNullable();
      table.text("description");
      table.string("resolution");
      table.integer("refresh_rate");
      table.string("panel_type");
      table.decimal("screen_size", 5, 2);
      table.decimal("price", 15, 2).notNullable();
      table.decimal("rating", 3, 2).defaultTo(0);
      table.boolean("featured").defaultTo(false);
      table.string("image_url");
      table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists("monitors")
    .dropTableIfExists("components");
};
