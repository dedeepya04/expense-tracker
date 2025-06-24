const xlsx= require('xlsx');
const Income= require('../models/Income');
exports.addIncome= async(req, res)=> {
    const userId=req.user?.id;
    console.log("Incoming income add request from:", userId);
  console.log(" Body:", req.body);

    try{
        const {icon,source,amount,date}= req.body;

        if(!source || !amount || !date){
            return res.status(400).json({message: "All fields are required"});
        }

        const newIncome= new Income({
            userId,
            icon,
            source,
            amount,
            date: new Date(date)
        });

        await newIncome.save();
        res.status(200).json(newIncome);
    } catch (error) {
        console.error(" Error in addIncome:", error);
        res.status(500).json({message: "Server Error"});
    }
};

exports.getAllIncome= async(req, res)=> {
    const userId= req.user.id;

    try{
        const income= await Income.find({ userId}).sort({date: -1});
        res.json(income);
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
}

exports.deleteIncome= async(req, res)=> {
   

    try{
        await Income.findByIdAndDelete(req.params.id);
        res.json({message: "Income deleted succesfully "});
    } catch (error) {
        res.status(500).json({message: "Server Error"});
    }
};

exports.downloadIncomeExcel= async(req, res)=> {
    const userId=req.user.id;
    try{
        const income= await Income.find({userId}).sort({date: -1});

        const data= income.map((item) => ({
            Source: item.source,
            Amount: item.amount,
            Date: item.date,
        })
        );

        const wb= xlsx.utils.book_new();
        const ws=xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb,ws,"Income");
        const buffer = xlsx.write(wb, { type: "buffer", bookType: "xlsx" });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=income_details.xlsx"
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