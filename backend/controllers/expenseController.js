const xlsx= require('xlsx');
const Expense= require('../models/Expense');


exports.addExpense= async(req, res)=> {
    const userId=req.user.id;

    try{
        const {icon,category,amount,date}= req.body;

        console.log("Expense POST body:", { icon, category, amount, date });

        if(!category || !amount || !date){
            console.log("Missing required fields");
            return res.status(400).json({message: "All fields are required"});
        }

        const newExpense= new Expense({
            userId,
            icon,
            category,
            amount,
            date: new Date(date)
        });
        
        await newExpense.save();
        res.status(200).json(newExpense);
    } catch (error) {
         console.error("Error in addExpense:", error);
        res.status(500).json({message: "Server Error"});
    }
}

exports.getAllExpense= async(req, res)=> {
    const userId= req.user.id;

    try{
        const expense= await Expense.find({ userId}).sort({date: -1});
        res.json(expense);
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
}

exports.deleteExpense= async(req, res)=> {
   

    try{
        await Expense.findByIdAndDelete(req.params.id);
        res.json({message: "Expense deleted succesfully "});
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
};

exports.downloadExpenseExcel= async(req, res)=> {
    const userId=req.user.id;
    try{
        const expense= await Expense.find({userId}).sort({date: -1});

        const data= expense.map((item) => ({
            category: item.category,
            Amount: item.amount,
            Date: item.date,
        })
        );

        const wb= xlsx.utils.book_new();
        const ws=xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb,ws,"Expense");
        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense_details.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    return res.send(buffer);
  } catch (error) {
    console.error(" Error generating Excel file:", error);
    res.status(500).json({ message: "Server Error" });
  }
};