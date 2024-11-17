const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const axios = require('axios'); //Axios is a promise based HTTP client for the browser and node.js (Preferred over fetch).

//@desc    Fetch internship from Adzuna
//@route   GET /api/jobs
//@access  Public
const getJobs = asyncHandler(async (req, res) => {
    try{   
        // Query parameters
        const {
            page = 1,
            location = '',
            keywords = '',
            sort_by = 'date',
            full_time = false,
            results_per_page = 10
        } = req.query;

        // Build Adzuna API URL with params
        let apiURL = `https://api.adzuna.com/v1/api/jobs/ca/search/1`;

        // Build query parameters
        const params = {
            app_id: process.env.ADZUNA_APP_ID || '51af41ea',
            app_key: process.env.ADZUNA_APP_KEY || 'c6d393a5ec17aba83f24422a6feb7edf',
            results_per_page,
            what: keywords ? `internship ${keywords}`.trim() : 'internship', //Always include 'internship' in the search query
            sort_by,
            where: location || undefined
        };

        console.log('Request Parameters:', params);

        const response = await axios.get('https://api.adzuna.com/v1/api/jobs/ca/search/1', { params });

        // Transform the response to a more frontend-friendly format
        const transformedResults = response.data.results.map(job => ({
            jobId: job.id,
            title: job.title,
            company: job.company.display_name,
            location: job.location.display_name,
            description: job.description,
            url: job.redirect_url,
            created: job.created,
            category: job.category.label
        }));

        return res.json({
            success: true,
            count: response.data.count,
            totalResults: response.data.total,
            currentPage: parseInt(page),
            resultsPerPage: parseInt(results_per_page),
            results: transformedResults
        });

    }catch(error){
        // ?. (Optional chaining): allows you to access deeply nested object properties without worrying if the property exists or not.
       console.error('Job fetch error: ', error.response?.data || error.message );
       return res.status(error.response?.status || 500).json({
        success: false,
        message: 'Error fetching jobs from Adzuna',
        error: error.response?.data || error.message
        });
    }
});

//@desc   Save job to user's savedJobs
//@route  POST /api/jobs/save
//@access Private
const saveJob = asyncHandler(async (req, res) => {
    try{
        const user = await User.findById(req.user._id);
        const jobData = req.body;

        // Validate required fields
        if(!jobData.jobId || !jobData.title || !jobData.company){
            return res.status(400).json({
                success: false,
                message: 'Missing required job information'
            });
        }

        // Check if job is already saved
        const jobExists = user.savedJobs.find((job) => job.jobId === jobData.jobId);

        if(jobExists){
            return res.status(400).json({
                success: false,
                message: 'Job already saved'
            });
        }

        user.savedJobs.push(jobData); //Add job to savedJobs array
        await user.save();

        res.status(201).json({
            success: true,
            job: jobData
        });
    }catch(err){
        res.status(500);
        throw new Error('Error saving job');
    } 
});

const removeSavedJob = asyncHandler(async (req, res) => {
    try{
        // Find user and jobId
        const user = await User.findById(req.user._id);
        const jobId = req.params.id;

        // Find the job index
        const jobIndex = user.savedJobs.findIndex(job => job.jobId === jobId);

        //Check if job exists
        if(jobIndex === -1){
            return res.status(404).json({
                success: false,
                message: 'Job not found'
            });
        }

        //Remove the job from saved jobs array
        user.savedJobs.splice(jobIndex, 1);
        await user.save();

        res.json({
            success: true,
            message: 'Job removed from saved jobs'
        });
    }catch(err){
        console.error('Remove saved job error: ', err);
        res.status(500).json({
            success: false,
            message: 'Error removing saved job',
            error: err.message
        });
    }
});

//@desc   Get user's saved jobs
//@route  GET /api/jobs/saved
//@access Private
const getSavedJobs = asyncHandler(async (req, res) => {
    try{
        const user = await User.findById(req.user._id);

        res.json({
            success: true,
            savedJobs: user.savedJobs
        });
    }catch(err){
        console.error('Get saved jobs error: ', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching saved jobs',
            error: err.message
        });
    }
})



module.exports = {
    getJobs,
    saveJob,
    removeSavedJob,
    getSavedJobs
}