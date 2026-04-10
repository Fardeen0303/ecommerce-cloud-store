import { Step, StepLabel, Stepper } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";
import { formatDate } from "../../../utils/functions";

const Tracker = ({ activeStep, orderOn }) => {
    const steps = [
        {
            status: "Ordered",
            dt: formatDate(orderOn),
        },
        {
            status: "Shipped",
        },
        {
            status: "Out For Delivery",
        },
        {
            status: "Delivered",
        },
    ];

    const completedIcon = (
        <span className="text-primaryGreen animate-pulse">
            <CircleIcon sx={{ fontSize: "16px" }} />
        </span>
    );
    const pendingIcon = (
        <span className="text-gray-400">
            <CircleIcon sx={{ fontSize: "16px" }} />
        </span>
    );
    const cancelledIcon = (
        <span className="text-red-600">
            <CircleIcon sx={{ fontSize: "16px" }} />
        </span>
    );

    if (activeStep === -1) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="text-center">
                    {cancelledIcon}
                    <p className="text-red-600 font-semibold mt-2">Order Cancelled</p>
                </div>
            </div>
        );
    }

    return (
        <Stepper activeStep={activeStep} alternativeLabel>
            {steps?.map((item, index) => (
                <Step
                    key={index}
                    active={activeStep === index ? true : false}
                    completed={activeStep >= index ? true : false}
                >
                    <StepLabel
                        icon={activeStep >= index ? completedIcon : pendingIcon}
                    >
                        {activeStep >= index ? (
                            <span className="text-primaryGreen font-medium">
                                {item.status}
                            </span>
                        ) : (
                            <span className="text-gray-400 font-medium">
                                {item.status}
                            </span>
                        )}
                    </StepLabel>
                </Step>
            ))}
        </Stepper>
    );
};

export default Tracker;
