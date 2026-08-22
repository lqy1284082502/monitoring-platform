import classes from './index.module.less';
interface CityLabelProps {
    city: string;
}
function CityLabel(props: CityLabelProps) {
    return (
        <div className={classes.container}>
            <span className={classes['city-label']}>{props.city}</span>
        </div>
    );
}

export default CityLabel;
