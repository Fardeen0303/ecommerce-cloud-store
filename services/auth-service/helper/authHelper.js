import bcrypt from "bcrypt";

export const hashPassword = async (password) => {
    try {
        return await bcrypt.hash(password, 10);
    } catch (error) {
        console.log(`Error hashing password: ${error}`);
    }
};

export const comparePassword = async (password, hashedPassword) => {
    try {
        return bcrypt.compare(password, hashedPassword);
    } catch (error) {
        console.log(`Error comparing password: ${error}`);
    }
};
