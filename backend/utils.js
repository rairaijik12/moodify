//LIST OF ALL UTILITY FUNCTIONS

//CHECKS IF THE ARGUMENT IS NULL OR NOT. RETURNS TRUE IF THE ARGUMENT IS NULL, OTHERWISE RETURNS FALSE.
const checkIfNull = (data) => {
    return (data == null || data === "null" || data === "" || (typeof data === 'string' && data.trim() === '') || (typeof data === "undefined"))
  }
  
  //CHECKS IF THE VALUE OF A MANDATORY FIELD IS NULL OR NOT. RETURNS TRUE IF ALL MANDATORY FIELDS ARE NOT NULL, OTHERWISE RETURNS FALSE.
  const checkMandatoryFields = (arrs)=>{
    let result = true
    
    arrs.forEach(el => {
        if (checkIfNull(el)){
            result = false
        }
    });
  
    return result 
  }

  const isValidDate = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

const isValidTime = (timeString) => {
    const regex = /^([01]\d|2[0-3]):([0-5]\d)$/; // Matches HH:MM in 24-hour format
    return regex.test(timeString);
};
  



  module.exports = {
    checkIfNull, 
    checkMandatoryFields,
    isValidDate,
    isValidTime
  }