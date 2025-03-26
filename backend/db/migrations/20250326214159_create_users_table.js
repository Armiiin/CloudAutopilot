/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('id').primary(); // Auto-incrementing integer ID, primary key
        table.string('email').notNullable().unique(); // Email column, required, unique
        table.string('username').notNullable().unique(); // Username column, required, unique
        table.string('hashedPassword').notNullable(); // Stores the hashed password, required
        table.timestamps(true, true); // Adds created_at and updated_at columns
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('users'); // Reverses the 'up' action
};
