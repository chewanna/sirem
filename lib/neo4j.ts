import neo4j from 'neo4j-driver';

const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
const user = process.env.NEO4J_USER || 'neo4j';
const password = process.env.NEO4J_PASSWORD || 'sirem_password';

// Configure the driver. In production, consider adding encryption options.
export const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

export async function getSession() {
    return driver.session();
}

export async function closeDriver() {
    await driver.close();
}
