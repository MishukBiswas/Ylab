              {member.education && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Education
                  </h3>
                  <div className="space-y-2 text-gray-600">
                    {(Array.isArray(member.education) ? member.education : member.education.split(',').map(edu => edu.trim())).map((edu, index) => (
                      <p key={index} className="flex items-start">
                        <span className="text-blue-600 mr-2">•</span>
                        {edu}
                      </p>
                    ))}
                  </div>
                </div>
              )} 

<div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fadeIn">
  <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideIn">
    <div className="relative">
  </div>
</div>
</div> 