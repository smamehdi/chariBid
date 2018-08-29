import Slider from 'react-animated-slider';
import React, { Component } from 'react'
import 'react-animated-slider/build/horizontal.css';
import 'normalize.css/normalize.css';
import './slider-animations.css';
import './slider-styles.css';

const content = [
	{
		title: 'Amis du Jardin',
		description:
		'Depuis 1975, les Amis du Jardin botanique de Montréal soutiennent la mission culturelle, éducative et scientifique du Jardin botanique de Montréal.Par l’entremise de diverses activités, les Amis du Jardin s’emploient à diffuser au grand public les connaissances relatives à la botanique et à l’horticulture.',
		button: 'read more',
		image: './images/banner/jardin.jpg',
		user: 'AmisDuJardin',
		userProfile: './images/amisdujardinLogo.PNG'
	},
	{
		title: 'Canada World Youth',
		description:
		'Canada World Youth offers world-renowned international volunteer programs to youth from Canada and abroad who, through their participation in community-driven development projects, acquire the leadership skills that allow them to become agents of change.',
		button: 'Discover',
		image: './images/banner/cwy.jpg',
		user: 'CanadaWorldYouth',
		userProfile: './images/canadaworldyouthLogo.PNG'
	},
	{
		title: 'Food Secure Canada',
		description:
		'Food Secure Canada is a pan-Canadian alliance of organizations and individuals working together to advance food security and food sovereignty through three inter-locking goals: zero hunger, healthy and safe food, and sustainable food systems.',
		button: 'Read More',
		image: './images/banner/foodsc.PNG',
		user: 'FoodSecureCanada',
		userProfile: './images/foodsecurecanadaLogo.PNG'
	}
];
class HeroSlider extends Component {
    constructor() {
        super();
        this.state = {}; 
    }
    
    render () {
        return (
            <Slider className="slider-wrapper">
            {content.map((item, index) => (
				<div
					key={index}
					className="slider-content"
					style={{ background: `url('${item.image}') no-repeat center center` }}
				>
					<div className="inner">
						<h1>{item.title}</h1>
						<p>{item.description}</p>
						<button>{item.button}</button>
					</div>
					<section>
						<img src={item.userProfile} alt={item.user} />
						<span>
							Posted by <strong>{item.user}</strong>
						</span>
					</section>
				</div>
			))}
            </Slider>
        )
    }

}


export default HeroSlider;
