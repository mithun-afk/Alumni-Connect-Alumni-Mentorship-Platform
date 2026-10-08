const Opportunity = require('../models/Opportunity');
const Notification = require('../models/Notification');

exports.createOpportunity = async (req, res) => {
  try {
    const { title, company, type, description, requirements, location, isRemote, applicationDeadline, applicationLink } = req.body;
    const newOpportunity = await Opportunity.create({
      postedBy: req.user._id,
      title,
      company,
      type,
      description,
      requirements,
      location,
      isRemote,
      applicationDeadline,
      applicationLink
    });
    res.json({ success: true, data: newOpportunity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getOpportunities = async (req, res) => {
  try {
    const { type, company } = req.query;
    const filter = {};
    if (type) filter.type = type;
    if (company) filter.company = new RegExp(company, 'i');
    
    const opportunities = await Opportunity.find(filter).populate('postedBy', 'firstName lastName email');
    res.json({ success: true, data: opportunities });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.applyOpportunity = async (req, res) => {
  try {
    const opportunityId = req.params.id;
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      return res.status(404).json({ success: false, message: 'Opportunity not found' });
    }

    const alreadyApplied = opportunity.applicants.some(app => app.user.toString() === req.user._id.toString());
    if (alreadyApplied) {
      return res.status(400).json({ success: false, message: 'Already applied' });
    }

    opportunity.applicants.push({ user: req.user._id });
    await opportunity.save();

    await Notification.create({
      user: opportunity.postedBy,
      type: 'OPPORTUNITY_APPLY',
      title: 'New Application',
      message: `A student has applied to your opportunity: ${opportunity.title}`,
      relatedId: opportunity._id
    });

    res.json({ success: true, data: opportunity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
